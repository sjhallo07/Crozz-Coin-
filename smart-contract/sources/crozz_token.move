address crozz {
    module crozz_token {
        use sui::coin::{Self, Coin, TreasuryCap, CoinMetadata};
        use sui::transfer;
        use sui::tx_context::{Self, TxContext};
        use sui::object::{Self, UID};
        use sui::url::{Self, Url};
        use std::option::{Self, Option};
        use std::string::{Self, String};
        use std::ascii::{Self, String as AsciiString};

        /// Token type marker
        public struct CROZZ has drop {}

        /// Administrative capability for metadata updates
        public struct AdminCap has key { id: UID }

        /// Initialize currency, metadata, and admin cap
        public fun init(witness: CROZZ, ctx: &mut TxContext) {
            let icon_url = option::some(url::new_unsafe(b"https://crozz-token.com/icon.png"));

            let (treasury_cap, metadata) = coin::create_currency<CROZZ>(
                witness,
                9,
                b"CROZZ",
                b"CROZZ Token",
                b"Official CROZZ Community Token",
                icon_url,
                ctx
            );

            let admin_cap = AdminCap { id: object::new(ctx) };

            transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
            transfer::public_transfer(admin_cap, tx_context::sender(ctx));
            transfer::public_transfer(metadata, tx_context::sender(ctx));
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
    }
}
