# Crozz-Coin Quickstart Guide

This guide shows you how to quickly set up and run the Crozz-Coin test dashboard.

## Prerequisites

- Node.js v18 or later
- npm package manager
- Internet connection

## Quick Start (One Command)

Run the complete ecosystem with a single command:

```bash
./scripts/quick-start.sh
```

This interactive script will:
- ✅ Check prerequisites (Node.js, npm)
- ✅ Install dependencies (backend + frontend)
- ✅ Set up environment files
- ✅ Start backend API (port 4000)
- ✅ Start frontend dashboard (port 5173)

## What You Get

After running the quickstart script:

### Backend API (http://localhost:4000)
- REST API for token operations
- WebSocket server for real-time events
- Transaction executor for blockchain operations
- Admin endpoints for privileged actions

**Key Endpoints:**
- `GET /api/tokens/summary` - Get token statistics
- `POST /api/tokens/mint` - Mint new tokens (admin)
- `POST /api/tokens/burn` - Burn tokens (admin)
- `POST /api/tokens/transfer` - Transfer tokens (admin)
- `GET /api/admin/jobs` - View transaction queue (admin)

### Frontend Dashboard (http://localhost:5173)
- Modern React-based user interface
- Real-time token statistics
- Wallet connection support
- User action panels for:
  - View balance
  - Verify as human (anti-bot)
  - Registry interaction
  - Guarded transfers
  - Standard transfers

## Run Options

When you run the quickstart script, you'll be prompted to choose:

1. **Start Backend only** - Run just the API server
2. **Start Frontend only** - Run just the dashboard
3. **Start Both (Recommended)** - Run complete ecosystem
4. **Start with Docker Compose** - Run in containers
5. **Setup Remote Tunnel** - Enable external access
6. **Exit** - Cancel operation

## Configuration

The quickstart script automatically creates configuration files:

### Root `.env`
Contains backend configuration including Sui network settings, admin keys, and smart contract IDs.

### Backend `.env`
Symlink to root `.env` for shared configuration.

### Frontend `.env`
```env
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_CROZZ_PACKAGE_ID=0xPACKAGE
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_METADATA_ID=0xMETADATA
VITE_CROZZ_VIEW_FUNCTION=get_icon_url
VITE_CROZZ_GAS_BUDGET=10000000
VITE_CROZZ_ADMIN_TOKEN=change-me
VITE_SUI_NETWORK=testnet
```

## Verifying the Setup

### Test Backend
```bash
curl http://localhost:4000/api/tokens/summary
```

Expected response:
```json
{
  "totalSupply": "0",
  "circulating": "0",
  "holderCount": 0,
  "totalSupplyFormatted": "0 CROZZ",
  "circulatingFormatted": "0 CROZZ",
  "holderCountFormatted": "0",
  "summaryText": "0 holders currently hold 0 CROZZ in circulation out of 0 CROZZ total supply.",
  "message": "Token summary retrieved successfully"
}
```

### Test Frontend
Open your browser to: http://localhost:5173

You should see:
- CROZZ Admin sidebar with navigation
- User Dashboard header with wallet connect button
- Testnet network indicator
- User actions panel with multiple interaction options

## Stopping the Services

If you started both services:
- Press `Ctrl+C` in the terminal to stop the frontend
- The backend will also be stopped automatically

If you started services separately:
- Press `Ctrl+C` in each terminal window

## Troubleshooting

### Port Already in Use
If ports 4000 or 5173 are in use:
```bash
# Check what's using the port
lsof -i :4000
lsof -i :5173

# Kill the process if needed
kill -9 <PID>
```

### Dependencies Not Installing
```bash
# Clear npm cache and reinstall
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json && npm install
```

### Backend Won't Start
Check that:
- Node.js version is 18+: `node --version`
- Environment files exist: `ls -la .env backend/.env`
- Port 4000 is available

### Frontend Won't Connect to Backend
Check that:
- Backend is running: `curl http://localhost:4000/api/tokens/summary`
- Frontend `.env` has correct API URL: `VITE_CROZZ_API_BASE_URL=http://localhost:4000`

## Next Steps

1. **Connect a Wallet** - Click "Connect Wallet" to link your Sui wallet
2. **Explore User Actions** - Try the various interaction options
3. **View Backend Logs** - Monitor API activity in the terminal
4. **Read Full Documentation** - See [README.md](README.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md)

## Remote Testing

Need to share your local development with others?

```bash
# Start services
./scripts/quick-start.sh
# Choose option 3 (Start Both)

# In another terminal, set up tunnel
./scripts/setup-tunnel.sh
# Choose option 1 (Cloudflare Tunnel - Recommended)
```

See [docs/REMOTE_TESTING.md](docs/REMOTE_TESTING.md) for details.

## Additional Resources

- **Scripts Documentation**: [scripts/README.md](scripts/README.md)
- **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **API Integration**: [API_INTEGRATION_REPORT.md](API_INTEGRATION_REPORT.md)
- **Dashboard Features**: [DASHBOARD_FEATURES.md](DASHBOARD_FEATURES.md)

---

**🎉 Congratulations!** You've successfully set up the Crozz-Coin test dashboard. Happy testing!
