# LegendLift Cross-Network Access Setup

## Current Active Tunnel

**Cloudflare Tunnel URL**: `https://stated-motion-lamp-undo.trycloudflare.com`

This tunnel allows you to access the backend from ANY network (WiFi, mobile data, different locations).

## How to Use

### Mobile App Configuration
The mobile app is already configured to use the tunnel:
- **File**: `src/constants/index.js`
- **BASE_URL**: `https://stated-motion-lamp-undo.trycloudflare.com/api/v1`

### Test Credentials
- **Admin**:
  - Email: `admin@legendlift.com`
  - Password: `admin123`
- **Technician**:
  - Email: `john@legendlift.com`
  - Password: `tech123`

## Running Services

### 1. Backend Server (Port 9000)
**Status**: ✅ Running (PID 18159)
```bash
# Check status
ps aux | grep "python run.py" | grep -v grep

# Restart if needed
cd /home/minnal/source/LegendLift/legendlift-backend
pkill -f "python run.py"
nohup python run.py > backend.log 2>&1 &
```

### 2. Cloudflare Tunnel
**Status**: ✅ Running (PID 26338)
**Location**: `/home/minnal/source/LegendLift/legendlift-backend/cloudflared`

```bash
# Check status
ps aux | grep cloudflared | grep -v grep

# View tunnel URL
tail -50 cloudflare-tunnel.log | grep "trycloudflare.com"

# Restart tunnel (generates new URL)
cd /home/minnal/source/LegendLift/legendlift-backend
pkill -f cloudflared
nohup ./cloudflared tunnel --url http://localhost:9000 > cloudflare-tunnel.log 2>&1 &
sleep 8
tail -50 cloudflare-tunnel.log | grep "trycloudflare.com"
```

**⚠️ Important**: When you restart the tunnel, it generates a NEW URL. You must update the mobile app's BASE_URL in `src/constants/index.js` with the new URL.

### 3. Expo Dev Server
**Status**: ✅ Running
```bash
# Check status
cd /home/minnal/source/LegendLift/legendlift-mobile
tail -20 expo.log

# Restart if needed
pkill -f "expo start"
nohup npx expo start --tunnel > expo.log 2>&1 &
```

## Testing the Tunnel

### Test Login Endpoint
```bash
# Admin login
curl -X POST https://stated-motion-lamp-undo.trycloudflare.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legendlift.com","password":"admin123","role":"admin"}'

# Technician login
curl -X POST https://stated-motion-lamp-undo.trycloudflare.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@legendlift.com","password":"tech123","role":"technician"}'
```

## All Recent Fixes Applied ✅

1. **Circular Logo** - LoginScreen logo now displays as a perfect circle
2. **Text Visibility** - Improved contrast (textSecondary: Grey 700, textTertiary: Grey 600)
3. **Back Buttons** - All detail screens have working back navigation
4. **Cross-Network Access** - Cloudflare tunnel enables access from any network

## Troubleshooting

### If tunnel stops working:
1. Check if cloudflared process is running: `ps aux | grep cloudflared`
2. Check tunnel logs: `tail -50 cloudflare-tunnel.log`
3. Restart tunnel (see commands above)
4. Update mobile app BASE_URL with new tunnel URL
5. Test the new URL with curl before using in app

### If backend is not responding:
1. Check backend process: `ps aux | grep "python run.py"`
2. Check backend logs: `tail -50 /home/minnal/source/LegendLift/legendlift-backend/backend.log`
3. Restart backend if needed
4. Ensure it's listening on port 9000: `lsof -i :9000`

### If mobile app won't connect:
1. Verify tunnel URL is accessible (use curl test above)
2. Check mobile app BASE_URL in `src/constants/index.js`
3. Clear React Native cache: `cd legendlift-mobile && npx expo start -c`
4. Check Expo dev server logs: `tail -30 expo.log`

## Network Comparison

### Option 1: Local IP (Same Network Only)
- **Pros**: Fast, stable, no external dependencies
- **Cons**: Only works on same WiFi network
- **URL**: `http://172.28.222.133:9000/api/v1`

### Option 2: Cloudflare Tunnel (Any Network) ✅ CURRENT
- **Pros**: Works from anywhere, secure HTTPS
- **Cons**: URL changes on restart, slight latency
- **URL**: `https://stated-motion-lamp-undo.trycloudflare.com/api/v1`

## Quick Start All Services

```bash
# Start everything in the correct order
cd /home/minnal/source/LegendLift/legendlift-backend

# 1. Backend
nohup python run.py > backend.log 2>&1 &

# 2. Cloudflare Tunnel (wait for backend to be ready)
sleep 5
nohup ./cloudflared tunnel --url http://localhost:9000 > cloudflare-tunnel.log 2>&1 &

# 3. Get tunnel URL
sleep 8
tail -50 cloudflare-tunnel.log | grep -E "trycloudflare.com|Your quick Tunnel"

# 4. Start Expo (from mobile directory)
cd ../legendlift-mobile
nohup npx expo start --tunnel > expo.log 2>&1 &
```

---

**Last Updated**: 2025-11-26 19:20 IST
**Tunnel URL Valid Until**: Process restart
