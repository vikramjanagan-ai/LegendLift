# 🚀 LegendLift - Final Commands to Start Mobile App

## ✅ Backend Status

- **Backend API**: ✅ RUNNING on http://localhost:9000
- **Backend Tunnel**: ✅ ACTIVE at https://clean-hornets-laugh.loca.lt
- **PostgreSQL**: ✅ CONNECTED with 516+ records

---

## 📱 COMMAND TO START MOBILE APP IN TUNNEL MODE

Open a **NEW TERMINAL** and run this **SINGLE COMMAND**:

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile && npx expo start --tunnel
```

### Or use the script:

```bash
bash /home/minnal/source/LegendLift/START_MOBILE_TUNNEL.sh
```

---

## 📊 What Will Happen

After running the command, you'll see:

```
Starting project at /home/minnal/source/LegendLift/legendlift-mobile
Starting Metro Bundler
Tunnel connected.
Tunnel ready.

› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Web is waiting on http://localhost:8081

› Using Expo Go
› Press s │ switch to development build

› Press a │ open Android
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor

› Press ? │ show all commands
```

---

## 📱 How to Access on Your Phone

### Step 1: Download Expo Go App

- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS**: https://apps.apple.com/app/expo-go/id982107779

### Step 2: Open Expo DevTools

The command will **automatically open** a browser window at:
```
http://localhost:19002
```

If it doesn't open automatically, **manually open** this URL in your browser.

### Step 3: Scan QR Code

**On Android:**
1. Open **Expo Go** app
2. Tap **"Scan QR Code"**
3. Scan the QR code from the browser or terminal

**On iOS:**
1. Open **Camera** app (not Expo Go)
2. Point at the QR code
3. Tap the notification that appears
4. It will open in Expo Go automatically

### Step 4: Wait for App to Load

- First load: 30-60 seconds (building JavaScript bundle)
- Shows progress bar and "Building..."
- Subsequent loads: Much faster

---

## 🎨 What You'll See

### Login Screen (Purple Gradient Theme):
- Purple gradient background
- White rounded card
- LegendLift logo
- Role selector (Admin/Technician)
- Email and password inputs (rounded)
- Purple gradient LOGIN button
- Demo credentials card

### After Login (Admin Dashboard):
- Statistics cards (customers, services, etc.)
- Colored icon backgrounds
- Alert cards for overdue services
- Performance metrics
- Quick action buttons

---

## 🔐 Login Credentials

### Admin:
```
Email: admin@legendlift.com
Password: admin123
Role: Admin
```

### Technician:
```
Email: john@legendlift.com
Password: tech123
Role: Technician
```

---

## ⚡ Quick Command Reference

### Start Mobile App (Tunnel Mode):
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile && npx expo start --tunnel
```

### Start Mobile App (LAN Mode - Same WiFi):
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile && npx expo start
```

### Start Mobile App (Localhost Only):
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile && npx expo start --localhost
```

### Stop Mobile App:
```
Press Ctrl+C in the terminal
```

Or:
```bash
pkill -f expo && pkill -f metro
```

---

## 🌐 Tunnel Explanation

### What is Tunnel Mode?

**Tunnel Mode** uses **ngrok** to create a public URL that:
- ✅ Works on **any network** (no need for same WiFi)
- ✅ Works on **cellular data**
- ✅ Works from **different countries**
- ✅ Bypasses firewall restrictions
- ✅ No port forwarding needed

### URLs in Tunnel Mode:

- **Backend API**: https://clean-hornets-laugh.loca.lt/api/v1
- **Mobile App**: exp://[random-ngrok-url]:8081 (automatically generated)
- **Expo DevTools**: http://localhost:19002 (on your computer)

---

## 🔧 Troubleshooting

### QR Code Not Showing in Terminal:
✅ **Solution**: Open http://localhost:19002 in browser - QR code will be there

### "Tunnel connection failed":
```bash
# Restart with clean cache
cd /home/minnal/source/LegendLift/legendlift-mobile
npx expo start --tunnel --clear
```

### "Unable to resolve module":
```bash
# Clear cache and restart
cd /home/minnal/source/LegendLift/legendlift-mobile
rm -rf .expo
npx expo start --tunnel --clear
```

### App Shows White Screen:
1. Shake your device
2. Tap "Reload"
3. Or press `r` in terminal to reload

### "Network request failed":
- Check backend is running: `curl http://localhost:9000/`
- Check tunnel is active: `curl https://clean-hornets-laugh.loca.lt/`
- Verify mobile app API config in `src/constants/index.js`

---

## 📋 Complete System Status

| Component | Status | Details |
|-----------|--------|---------|
| **Backend Server** | ✅ RUNNING | Port 9000 |
| **Backend Tunnel** | ✅ ACTIVE | https://clean-hornets-laugh.loca.lt |
| **PostgreSQL** | ✅ CONNECTED | 212 customers, 257 services |
| **Mobile App** | ⏳ READY TO START | Run command above |

---

## 🎯 Final Steps

### 1. Open Terminal and Run:
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile && npx expo start --tunnel
```

### 2. Wait for:
- "Tunnel ready" message
- QR code to appear
- Browser to open with DevTools

### 3. On Your Phone:
- Open Expo Go app
- Scan QR code
- Wait for app to build and load

### 4. Login:
- Select "Admin" role
- Email: admin@legendlift.com
- Password: admin123
- Tap LOGIN

### 5. Explore:
- View purple gradient UI
- Check dashboard statistics
- Navigate through screens
- Test functionality

---

## 💡 Pro Tips

1. **Keep Terminal Open**: Don't close the terminal while using the app
2. **Reload Anytime**: Press `r` in terminal to reload app
3. **Clear Cache**: Press `Shift+r` to reload with cache clear
4. **View Logs**: All logs appear in terminal in real-time
5. **Web Version**: Press `w` to open in web browser (for quick testing)

---

## 🎉 You're All Set!

Everything is configured and ready. Just run the command above and scan the QR code!

---

## 📞 Need Help?

Check these files:
- `RUNNING_STATUS.md` - Current system status
- `COMPLETE_STATUS_REPORT_2025-11-25.md` - Full project details
- Backend logs: `/home/minnal/source/LegendLift/legendlift-backend/backend.log`

---

**Run this command now:**
```bash
cd /home/minnal/source/LegendLift/legendlift-mobile && npx expo start --tunnel
```

**Then scan the QR code with Expo Go app!** 🚀

---

*Last Updated: November 25, 2025*
