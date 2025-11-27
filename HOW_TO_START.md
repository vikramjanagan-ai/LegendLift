# 🚀 How to Start LegendLift Backend (SIMPLE!)

## ✅ AUTOMATIC SOLUTION - Use This!

Just run this ONE command:

```bash
cd /home/minnal/source/LegendLift
bash start_backend_with_tunnel.sh
```

**This script automatically:**
1. ✅ Stops old services
2. ✅ Starts backend on port 9000
3. ✅ Creates a tunnel with LocalTunnel
4. ✅ **AUTO-UPDATES the mobile app config** with the new tunnel URL
5. ✅ Saves the tunnel URL to `CURRENT_TUNNEL_URL.txt`

**You'll never have connection issues again!** The mobile app config is updated automatically.

---

## 📱 Why URLs Keep Changing

### The Problem:
- LocalTunnel gives you **random URLs** like `https://random-words-here.loca.lt`
- Every restart = New random URL
- Mobile app was hardcoded with old URL → Connection failed

### The Solution:
Our new script **automatically updates** the mobile app config with the current tunnel URL!

### File Updated Automatically:
```
legendlift-mobile/src/constants/index.js
```

---

## 🔄 How to Restart Backend

Just run:
```bash
bash /home/minnal/source/LegendLift/start_backend_with_tunnel.sh
```

Mobile app config will be updated automatically!

---

## 🛑 How to Stop Backend

```bash
pkill -f uvicorn && pkill -f localtunnel
```

---

## 📊 Current Status

- **Backend**: http://localhost:9000
- **Tunnel**: https://curly-cases-rescue.loca.lt
- **Mobile Config**: ✅ Auto-updated
- **API URL**: https://curly-cases-rescue.loca.lt/api/v1

---

## 🎯 Why We Can't Use a Fixed URL (Answered)

### Free Tunnel Options:
1. **LocalTunnel** - Random URLs (what we use now)
2. **Ngrok Free** - Needs auth token + random URLs
3. **Cloudflare Tunnel** - Network issues on WSL

### Paid Options for Fixed URL:
1. **Ngrok Paid** - $8/month for custom domain
2. **Cloudflare Tunnel** - Free but needs domain setup
3. **Your own server** - Deploy to cloud with static IP

### Our Solution:
**Auto-update script** that solves the problem! No need for paid services.

---

## ✅ Summary

**Problem**: URLs keep changing, mobile can't connect
**Solution**: Auto-update script that syncs mobile config
**Result**: Zero manual configuration needed!

Just run `bash start_backend_with_tunnel.sh` and you're good to go! 🚀
