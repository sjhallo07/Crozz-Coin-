# Remote Testing Guide for Crozz-Coin

This guide provides comprehensive instructions for setting up remote access to your Crozz-Coin dashboard for testing with clients, team members, or remote devices.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Tunnel Options](#tunnel-options)
- [Setup Methods](#setup-methods)
- [Testing Scenarios](#testing-scenarios)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Overview

The Crozz-Coin ecosystem consists of:

- **Backend API** (Port 4000): REST API and WebSocket server
- **Frontend Dashboard** (Port 5173): React-based UI

For remote testing, you need to expose both services to the internet using a tunnel service.

### What is a Tunnel?

A tunnel creates a secure connection from a public URL to your local development server, allowing remote users to access your application without complex network configuration.

### When to Use Remote Testing

- ✅ Client demonstrations
- ✅ Team testing across different networks
- ✅ Mobile device testing
- ✅ Remote stakeholder reviews
- ✅ Cross-browser testing services
- ❌ Production deployments (use proper hosting)

## Quick Start

### Automated Setup (Recommended)

```bash
# Clone and navigate to repository
cd /path/to/Crozz-Coin-

# Run quick start script
./scripts/quick-start.sh

# Choose option 5 for "Setup Remote Tunnel"
```

The script will:

1. Check prerequisites
2. Install tunnel software if needed
3. Start tunnels for both backend and frontend
4. Display public URLs for sharing

### Manual Setup

If you prefer manual control:

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Setup Tunnels (see options below)
```

## Tunnel Options

### Option 1: Cloudflare Tunnel (Recommended)

**Pros:**

- ✅ Free and unlimited
- ✅ Fast and reliable
- ✅ No account required
- ✅ HTTPS by default
- ✅ Works behind corporate firewalls

**Installation:**

```bash
# macOS
brew install cloudflared

# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Windows
winget install Cloudflare.cloudflared
```

**Usage:**

```bash
# Terminal 3: Backend tunnel
cloudflared tunnel --url http://localhost:4000

# Terminal 4: Frontend tunnel
cloudflared tunnel --url http://localhost:5173
```

**Automated:**

```bash
./scripts/setup-tunnel.sh
# Select option 1 (Cloudflare Tunnel)
```

### Option 2: Ngrok

**Pros:**

- ✅ Popular and well-documented
- ✅ Custom domains (paid)
- ✅ Request inspection dashboard
- ✅ Advanced features (auth, IP whitelisting)

**Cons:**

- ⚠️ Requires account for persistent URLs
- ⚠️ Free tier has connection limits

**Installation:**

```bash
# Install
npm install -g ngrok

# Or with Homebrew (macOS)
brew install ngrok/ngrok/ngrok

# Authenticate (required)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

**Usage:**

```bash
# Backend tunnel
ngrok http 4000

# Frontend tunnel (in another terminal)
ngrok http 5173
```

### Option 3: localhost.run (SSH-based)

**Pros:**

- ✅ No installation required
- ✅ Uses standard SSH
- ✅ No account needed
- ✅ Works everywhere SSH works

**Cons:**

- ⚠️ Slower than other options
- ⚠️ Connection can be unstable

**Usage:**

```bash
# Backend tunnel
ssh -R 80:localhost:4000 localhost.run

# Frontend tunnel
ssh -R 80:localhost:5173 localhost.run
```

**Automated:**

```bash
./scripts/setup-tunnel.sh
# Select option 2 (localhost.run)
```

### Option 4: Localtunnel

**Pros:**

- ✅ NPM package (easy for Node.js developers)
- ✅ No account required
- ✅ Custom subdomains available

**Installation:**

```bash
npm install -g localtunnel
```

**Usage:**

```bash
# Backend tunnel
lt --port 4000

# Frontend tunnel
lt --port 5173

# With custom subdomain
lt --port 4000 --subdomain crozz-backend
lt --port 5173 --subdomain crozz-frontend
```

### Option 5: Serveo (SSH-based)

**Pros:**

- ✅ No installation
- ✅ Custom subdomains
- ✅ SSH forwarding

**Usage:**

```bash
# Backend tunnel
ssh -R crozz-backend:80:localhost:4000 serveo.net

# Frontend tunnel
ssh -R crozz-frontend:80:localhost:5173 serveo.net
```

## Setup Methods

### Method 1: Automated Quick Start

**Best for:** First-time users, quick demos

```bash
cd Crozz-Coin-
./scripts/quick-start.sh
```

Follow the interactive menu to:

1. Install dependencies
2. Set up environment files
3. Start services
4. Create tunnels

### Method 2: Manual Step-by-Step

**Best for:** Experienced developers, custom configurations

#### Step 1: Prepare Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env

# Create frontend environment
cat > frontend/.env <<EOF
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_SUI_NETWORK=testnet
VITE_CROZZ_ADMIN_TOKEN=change-me
EOF
```

#### Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### Step 3: Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### Step 4: Create Tunnels

Choose your preferred tunnel method from the options above.

#### Step 5: Update Frontend Configuration

If your backend tunnel URL is different from localhost:

```bash
# Update frontend/.env
echo "VITE_CROZZ_API_BASE_URL=https://your-backend-url.trycloudflare.com" >> frontend/.env

# Restart frontend
# Press Ctrl+C in Terminal 2, then:
npm run dev
```

### Method 3: Docker Compose

**Best for:** Containerized deployments, consistent environments

```bash
# Build and run
docker compose up --build

# In another terminal, create tunnels
cloudflared tunnel --url http://localhost:4000
cloudflared tunnel --url http://localhost:5173
```

## Testing Scenarios

### Scenario 1: Client Demo

**Setup:**

```bash
# Automated
./scripts/quick-start.sh
# Choose option 3 (Start Both) then option 5 (Setup Tunnel)

# Share URLs with client
# Backend: https://abc-123.trycloudflare.com
# Frontend: https://def-456.trycloudflare.com
```

**Testing:**

1. Client opens frontend URL
2. Dashboard loads and connects to backend
3. Client can test all features in real-time

### Scenario 2: Mobile Device Testing

**Setup:**

```bash
# Start services locally
./scripts/quick-start.sh
# Choose option 3 (Start Both)

# In another terminal, create tunnels
./scripts/setup-tunnel.sh
# Choose option 1 (Cloudflare)

# Open frontend URL on mobile device
```

**Testing:**

1. Scan QR code (if tunnel service provides one)
2. Test responsive design
3. Test touch interactions
4. Test wallet connections on mobile

### Scenario 3: Team Collaboration

**Setup:**

```bash
# Team member starts services
./scripts/quick-start.sh

# Create persistent tunnels (ngrok with custom domain)
ngrok http 4000 --domain=crozz-backend.ngrok.io
ngrok http 5173 --domain=crozz-frontend.ngrok.io

# Share URLs in team chat
```

**Testing:**

1. Multiple team members access simultaneously
2. Test collaborative features
3. Share feedback in real-time

### Scenario 4: Automated Testing Services

**Setup:**

```bash
# Start services
npm run dev --prefix backend &
npm run dev --prefix frontend &

# Create tunnels
cloudflared tunnel --url http://localhost:4000 > backend-tunnel.txt 2>&1 &
cloudflared tunnel --url http://localhost:5173 > frontend-tunnel.txt 2>&1 &

# Extract URLs
BACKEND_URL=$(grep -o 'https://[^[:space:]]*' backend-tunnel.txt | head -1)
FRONTEND_URL=$(grep -o 'https://[^[:space:]]*' frontend-tunnel.txt | head -1)

# Use in CI/CD or testing service
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
```

## Security Considerations

### ⚠️ Important Warnings

1. **Never expose production systems** via tunnels
2. **Don't use default credentials** for remote testing
3. **Tunnels are temporary** - URLs change on restart
4. **Monitor access** - check tunnel logs
5. **Limit exposure time** - close tunnels when done

### Best Practices

#### 1. Use Strong Authentication

```bash
# Update .env
ADMIN_TOKEN=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Share tokens securely (not in public channels)
```

#### 2. Enable Request Logging

```bash
# Backend logs all requests
# Check: /tmp/crozz-backend.log

# Monitor in real-time
tail -f /tmp/crozz-backend.log
```

#### 3. Use IP Whitelisting (Ngrok Pro)

```bash
ngrok http 4000 --cidr-allow 1.2.3.4/32
```

#### 4. Add Basic Auth (Cloudflare)

```bash
# Not directly supported - use backend middleware instead
```

#### 5. Time-Limited Sessions

```bash
# Stop tunnels after demo
pkill cloudflared
# or
kill $(cat /tmp/crozz-pids.txt)
```

### Temporary vs. Permanent Setup

#### Temporary Setup (Testing/Demos)

- ✅ Use free tunnel services
- ✅ Accept random URLs
- ✅ Quick setup, no configuration
- ⚠️ URLs change on restart
- ⚠️ Not suitable for bookmarks

#### Permanent Setup (Staging/Beta)

- ✅ Use paid tunnel services with custom domains
- ✅ Or deploy to proper hosting (Vercel, Railway, AWS)
- ✅ Persistent URLs
- ✅ Better reliability
- ⚠️ Requires configuration/payment

**Recommendation:** For real production use, deploy to proper cloud infrastructure:

- Frontend: Vercel, Netlify, AWS S3 + CloudFront
- Backend: Railway, Render, AWS ECS, Digital Ocean

## Troubleshooting

### Issue: Tunnel URL not accessible

**Symptoms:**

- Tunnel starts but URL returns 502/504
- "Connection refused" errors

**Solutions:**

```bash
# 1. Verify service is running
curl http://localhost:4000/api/tokens/summary
curl http://localhost:5173

# 2. Check if ports are correct
lsof -i :4000
lsof -i :5173

# 3. Check logs
tail -f /tmp/crozz-backend.log

# 4. Restart services
pkill node
./scripts/quick-start.sh
```

### Issue: Frontend can't connect to backend

**Symptoms:**

- Dashboard loads but shows "Connection Error"
- WebSocket fails to connect
- API requests timeout

**Solutions:**

```bash
# 1. Check frontend .env
cat frontend/.env | grep VITE_CROZZ_API_BASE_URL

# 2. Update to use tunnel URL
echo "VITE_CROZZ_API_BASE_URL=https://your-backend-url" > frontend/.env

# 3. Restart frontend
cd frontend
npm run dev

# 4. Check CORS settings in backend
# backend/src/server.js should have:
# app.use(cors({ origin: '*' })) // for testing only
```

### Issue: Tunnel keeps disconnecting

**Symptoms:**

- Tunnel URL stops working after a few minutes
- Need to restart tunnel frequently

**Solutions:**

```bash
# 1. Use more stable tunnel service
# Cloudflare > Ngrok > localhost.run

# 2. Check internet connection
ping 8.8.8.8

# 3. Use persistent tunnel (Ngrok with account)
ngrok http 4000 --region us

# 4. Monitor tunnel process
ps aux | grep cloudflared
```

### Issue: Authentication errors

**Symptoms:**

- "Unauthorized" errors
- Token validation fails

**Solutions:**

```bash
# 1. Ensure tokens match
grep ADMIN_TOKEN .env
grep VITE_CROZZ_ADMIN_TOKEN frontend/.env

# 2. Update both to same value
ADMIN_TOKEN="your-secret-token"
echo "ADMIN_TOKEN=$ADMIN_TOKEN" >> .env
echo "VITE_CROZZ_ADMIN_TOKEN=$ADMIN_TOKEN" >> frontend/.env

# 3. Restart both services
```

### Issue: Slow performance over tunnel

**Symptoms:**

- Long load times
- Laggy interactions
- Timeout errors

**Solutions:**

```bash
# 1. Use faster tunnel service (Cloudflare)
cloudflared tunnel --url http://localhost:5173

# 2. Choose closer tunnel region (Ngrok)
ngrok http 4000 --region eu  # if in Europe

# 3. Optimize application
# - Enable compression in backend
# - Reduce WebSocket message frequency
# - Use production build for frontend
cd frontend && npm run build && npm run preview

# 4. Check local performance first
# If slow locally, optimize before tunneling
```

## FAQ

### Q: Do I need to pay for tunnel services?

**A:** No, for testing purposes, free tiers are sufficient:

- Cloudflare Tunnel: Free, unlimited
- Ngrok: Free with limits (20 connections/minute)
- localhost.run: Free, unlimited
- Localtunnel: Free, unlimited

### Q: Can I use a custom domain?

**A:** Yes, with paid tunnel services:

- Ngrok: Custom domains from $8/month
- Cloudflare Tunnel: Free with Cloudflare domain

### Q: How long can I keep a tunnel open?

**A:** Depends on the service:

- Cloudflare: Indefinitely (restarts on connection loss)
- Ngrok free: 2-8 hours (auto-restarts)
- localhost.run: Until SSH connection closes

### Q: Is it safe to expose my local server?

**A:** For temporary testing, yes, if you:

- ✅ Use strong authentication
- ✅ Don't expose production data
- ✅ Monitor access logs
- ✅ Close tunnels when done
- ❌ Never use in production
- ❌ Don't expose sensitive data

### Q: Can multiple people access the same tunnel?

**A:** Yes! That's the purpose. Share the URL with:

- Clients for demos
- Team members for testing
- Stakeholders for reviews
- Testing services for automation

### Q: What if my tunnel URL changes?

**A:** Tunnel URLs change on restart (except paid Ngrok). Options:

1. Use persistent tunnel service (Ngrok with custom domain)
2. Update frontend .env and restart
3. Use environment variable substitution
4. Deploy to proper hosting for permanent URLs

### Q: Can I tunnel both services with one command?

**A:** Not directly, but you can script it:

```bash
# Create tunnel-both.sh
cloudflared tunnel --url http://localhost:4000 &
cloudflared tunnel --url http://localhost:5173 &
wait
```

Or use the provided scripts:

```bash
./scripts/setup-tunnel.sh
```

### Q: How do I stop all tunnels?

**A:**

```bash
# Kill by name
pkill cloudflared
pkill ngrok

# Or kill specific PIDs
kill $(cat /tmp/crozz-pids.txt)

# Or use Ctrl+C in terminal running tunnel
```

### Q: Can I test on my phone?

**A:** Yes! That's a common use case:

1. Start services locally
2. Create tunnel
3. Open tunnel URL on phone browser
4. Test mobile experience

For Sui wallet testing on mobile:

1. Install Sui wallet app
2. Open tunnel URL in mobile browser
3. Connect wallet
4. Test transactions

## Additional Resources

### Official Documentation

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Ngrok Documentation](https://ngrok.com/docs)
- [Sui Documentation](https://docs.sui.io/)

### Crozz-Coin Documentation

- [README.md](../README.md) - Main project documentation
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - Detailed setup instructions

### Community & Support

- [GitHub Issues](https://github.com/sjhallo07/Crozz-Coin-/issues)
- [Sui Discord](https://discord.gg/sui)

## Next Steps

After setting up remote testing:

1. **Test thoroughly** - Use the remote URLs to test all features
2. **Gather feedback** - Share with stakeholders and collect input
3. **Document issues** - Track bugs and improvements
4. **Deploy properly** - When ready, deploy to production hosting
5. **Monitor usage** - Track access logs and performance

## Summary

Remote testing with tunnels is perfect for:

- ✅ Quick demos and client presentations
- ✅ Team collaboration across networks
- ✅ Mobile and cross-device testing
- ✅ External stakeholder reviews

Remember:

- 🔒 Use strong authentication
- ⏱️ Tunnels are temporary
- 🚀 Deploy properly for production
- 📊 Monitor and log access

For questions or issues, check the [Troubleshooting](#troubleshooting) section or create an issue on GitHub.

---

**Happy Testing! 🚀**
