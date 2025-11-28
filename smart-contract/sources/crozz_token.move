address crozz {
    module crozz_token {
        use std::ascii::{Self, String as AsciiString};
        use std::option::{Self, Option};
        use std::string::{Self, String};
        use std::vector;

        use sui::clock::{Self, Clock};
        use sui::coin::{Self, Coin, CoinMetadata, TreasuryCap};
        use sui::dynamic_field as df;
        use sui::ed25519::ed25519_verify;
        use sui::event::emit;
        use sui::math;
        use sui::object::{Self, UID};
        use sui::transfer;
        use sui::tx_context::{Self, TxContext};
        use sui::url::{Self, Url};

        /// Token type marker
        public struct CROZZ has drop {}

        /// Administrative capability for metadata updates
        public struct AdminCap has key { id: UID }

        /// Shared registry that gates interactions behind a verification window.
        public struct AntiBotRegistry has key {
            id: UID,
            window: u64,
            /// Global kill-switch for emergency halts.
            global_freeze: bool,
        }

        /// Stored per-wallet verification metadata (dynamic field value).
        struct VerificationRecord has copy, drop, store {
            last_verified_ms: u64,
            is_frozen: bool,
        }

        struct InteractionEvent has copy, drop {
            sender: address,
            timestamp_ms: u64,
        }

        struct VerificationEvent has copy, drop {
            sender: address,
            timestamp_ms: u64,
        }

        struct WalletFreezeEvent has copy, drop {
            target: address,
            is_frozen: bool,
        }

        struct GlobalFreezeEvent has copy, drop {
            is_frozen: bool,
        }

        const TIME_WINDOW: u64 = 60_000;
        const EVerificationExpired: u64 = 0;
        const EInvalidSignature: u64 = 1;
        const ENotYetVerified: u64 = 2;
        const EGlobalFreezeActive: u64 = 3;
        const EWalletFrozen: u64 = 4;

        /// Initialize currency, metadata, and admin cap
        public fun init(witness: CROZZ, ctx: &mut TxContext) {
            let icon_url = option::some(url::new_unsafe(b"https://crozz-token.com/icon.png"));

            let (treasury_cap, metadata) = coin::create_currency<CROZZ>(
                witness,
                9,
                b"CROZZ",
                b"Crozz Coin",
                b"Official CROZZ Community Token - Created by Carlo Hung",
                icon_url,
                ctx
            );

            let admin_cap = AdminCap { id: object::new(ctx) };

            transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
            transfer::public_transfer(admin_cap, tx_context::sender(ctx));
            transfer::public_transfer(metadata, tx_context::sender(ctx));
        }

        /// Deploy and share an anti-bot registry. Call once (or per upgrade).
        public entry fun init_registry(_admin: &AdminCap, ctx: &mut TxContext) {
            transfer::share_object(AntiBotRegistry {
                id: object::new(ctx),
                window: TIME_WINDOW,
                global_freeze: false,
            });
        }

        /// Record a signed verification from an off-chain oracle/back-end.
        public entry fun verify_human(
            registry: &mut AntiBotRegistry,
            signature: vector<u8>,
            public_key: vector<u8>,
            msg: vector<u8>,
            ctx: &mut TxContext
        ) {
            let verified = ed25519_verify(&signature, &public_key, &msg);
            assert!(verified, EInvalidSignature);

            let timestamp_ms = msg_to_ts(&msg);
            upsert_record(registry, tx_context::sender(ctx), timestamp_ms);
            emit(VerificationEvent { sender: tx_context::sender(ctx), timestamp_ms });
        }

        /// Primary gating call for arbitrary interactions.
        public entry fun interact(
            registry: &mut AntiBotRegistry,
            clock: &Clock,
            ctx: &mut TxContext
        ) {
            assert_verified(registry, clock, tx_context::sender(ctx));
            emit(InteractionEvent {
                sender: tx_context::sender(ctx),
                timestamp_ms: clock::timestamp_ms(clock),
            });
        }

        /// Guarded token transfer that enforces a recent verification.
        public entry fun guarded_transfer(
            coin: Coin<CROZZ>,
            to: address,
            registry: &mut AntiBotRegistry,
            clock: &Clock,
            ctx: &mut TxContext
        ) {
            assert_verified(registry, clock, tx_context::sender(ctx));
            transfer::public_transfer(coin, to)
        }

        /// Administrative global freeze toggle (outline for emergency halts).
        public entry fun set_global_freeze(
            _admin: &AdminCap,
            registry: &mut AntiBotRegistry,
            freeze: bool
        ) {
            registry.global_freeze = freeze;
            emit(GlobalFreezeEvent { is_frozen: freeze });
        }

        /// Administrative wallet freeze helper illustrating targeted controls.
        public entry fun set_wallet_freeze(
            _admin: &AdminCap,
            registry: &mut AntiBotRegistry,
            target: address,
            freeze: bool,
            _ctx: &mut TxContext
        ) {
            if (!df::exists_with_type<address, VerificationRecord>(&registry.id, target)) {
                upsert_record(registry, target, 0);
            };

            let record = df::borrow_mut<address, VerificationRecord>(&mut registry.id, target);
            record.is_frozen = freeze;

            emit(WalletFreezeEvent { target, is_frozen: freeze });

            if (!freeze && record.last_verified_ms > 0) {
                emit(VerificationEvent { sender: target, timestamp_ms: record.last_verified_ms });
            }
        }

        public entry fun mint(
            treasury_cap: &mut TreasuryCap<CROZZ>,
            amount: u64,
            recipient: address,
            ctx: &mut TxContext
        ) {
            coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
        }

        public entry fun mint_to_self(
            treasury_cap: &mut TreasuryCap<CROZZ>,
            amount: u64,
            ctx: &mut TxContext
        ) {
            let recipient = tx_context::sender(ctx);
            coin::mint_and_transfer(treasury_cap, amount, recipient, ctx)
        }

        public entry fun burn(
            treasury_cap: &mut TreasuryCap<CROZZ>,
            coin: Coin<CROZZ>
        ) {
            coin::burn(treasury_cap, coin)
        }

        public entry fun transfer(
            coin: Coin<CROZZ>,
            to: address,
            _ctx: &mut TxContext
        ) {
            transfer::public_transfer(coin, to)
        }

        public entry fun update_name(
            _admin_cap: &AdminCap,
            treasury: &TreasuryCap<CROZZ>,
            metadata: &mut CoinMetadata<CROZZ>,
            name: String
        ) {
            coin::update_name(treasury, metadata, name)
        }

        public entry fun update_symbol(
            _admin_cap: &AdminCap,
            treasury: &TreasuryCap<CROZZ>,
            metadata: &mut CoinMetadata<CROZZ>,
            symbol: AsciiString
        ) {
            coin::update_symbol(treasury, metadata, symbol)
        }

        public entry fun update_description(
            _admin_cap: &AdminCap,
            treasury: &TreasuryCap<CROZZ>,
            metadata: &mut CoinMetadata<CROZZ>,
            description: String
        ) {
            coin::update_description(treasury, metadata, description)
        }

        public entry fun update_icon_url(
            _admin_cap: &AdminCap,
            treasury: &TreasuryCap<CROZZ>,
            metadata: &mut CoinMetadata<CROZZ>,
            new_icon_url: String
        ) {
            let bytes = string::into_bytes(new_icon_url);
            let url = url::new_unsafe(bytes);
            coin::update_icon_url(treasury, metadata, url)
        }

        public entry fun freeze_metadata(
            _admin_cap: &AdminCap,
            metadata: CoinMetadata<CROZZ>,
            _ctx: &mut TxContext
        ) {
            transfer::public_freeze_object(metadata)
        }

        public fun get_total_supply(treasury_cap: &TreasuryCap<CROZZ>): u64 {
            coin::total_supply(treasury_cap)
        }

        public fun get_balance(coin: &Coin<CROZZ>): u64 {
            coin::value(coin)
        }

        public fun get_decimals(metadata: &CoinMetadata<CROZZ>): u8 {
            coin::get_decimals(metadata)
        }

        public fun get_name(metadata: &CoinMetadata<CROZZ>): String {
            coin::get_name(metadata)
        }

        public fun get_symbol(metadata: &CoinMetadata<CROZZ>): AsciiString {
            coin::get_symbol(metadata)
        }

        public fun get_description(metadata: &CoinMetadata<CROZZ>): String {
            coin::get_description(metadata)
        }

        public fun get_icon_url(metadata: &CoinMetadata<CROZZ>): Option<Url> {
            coin::get_icon_url(metadata)
        }

        public fun has_admin_cap(_admin_cap: &AdminCap, _check_address: address): bool {
            true
        }

        /// Convert a decimal ASCII message into a timestamp (ms).
        fun msg_to_ts(message: &vector<u8>): u64 {
            let vec_length = vector::length(message);
            let (value, i) = (0u64, 0u8);
            while (i < 13) {
                let element = (*vector::borrow(message, vec_length - (i as u64) - 1) - 48 as u64);
                value = value + element * math::pow(10, i);
                i = i + 1;
            };
            value
        }

        fun assert_verified(registry: &AntiBotRegistry, clock: &Clock, user: address) {
            assert!(!registry.global_freeze, EGlobalFreezeActive);

            if (!df::exists_with_type<address, VerificationRecord>(&registry.id, user)) {
                abort ENotYetVerified
            };

            let record = df::borrow<address, VerificationRecord>(&registry.id, user);
            assert!(!record.is_frozen, EWalletFrozen);

            let current_timestamp = clock::timestamp_ms(clock);
            if (current_timestamp - record.last_verified_ms > registry.window) {
                abort EVerificationExpired
            }
        }

        fun upsert_record(registry: &mut AntiBotRegistry, user: address, timestamp_ms: u64) {
            if (!df::exists_with_type<address, VerificationRecord>(&registry.id, user)) {
                df::add<address, VerificationRecord>(
                    &mut registry.id,
                    user,
                    VerificationRecord { last_verified_ms: timestamp_ms, is_frozen: false }
                );
            } else {
                let record = df::borrow_mut<address, VerificationRecord>(&mut registry.id, user);
                record.last_verified_ms = timestamp_ms;
            }
        }
    }
}
