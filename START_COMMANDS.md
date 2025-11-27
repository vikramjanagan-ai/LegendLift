# 🚀 LegendLift - Quick Start Commands

## ✅ Services Are Already Running!

### Backend Status:
- **Local URL**: http://localhost:9000
- **Tunnel URL**: https://clean-hornets-laugh.loca.lt
- **API Docs**: https://clean-hornets-laugh.loca.lt/docs
- **Status**: ✅ Running

---

## 📱 Start Mobile App (Final Step)

Open a **NEW TERMINAL** and run:

```bash
cd /home/minnal/source/LegendLift/legendlift-mobile
npm start
```

This will:
1. Start the Expo development server
2. Show a QR code
3. Open Expo DevTools in your browser

### Access the App:
- **Android**: Open Expo Go app and scan the QR code
- **iOS**: Open Camera app and scan the QR code (opens Expo Go)
- **Web**: Press 'w' in terminal (opens in browser)
- **Android Emulator**: Press 'a' in terminal
- **iOS Simulator**: Press 'i' in terminal (macOS only)

---

## 🔐 Login Credentials

### Admin Account:
```
Email: admin@legendlift.com
Password: admin123
Role: Admin
```

### Technician Account:
```
Email: john@legendlift.com
Password: tech123
Role: Technician
```

---

## 📊 Backend Information

### API Endpoints (via Tunnel):
- Health Check: `https://clean-hornets-laugh.loca.lt/`
- Login: `https://clean-hornets-laugh.loca.lt/api/v1/auth/login`
- Customers: `https://clean-hornets-laugh.loca.lt/api/v1/customers/`
- Services: `https://clean-hornets-laugh.loca.lt/api/v1/services/`

### Test Backend:
```bash
curl -s https://clean-hornets-laugh.loca.lt/ \
  -H "Bypass-Tunnel-Reminder: true" | python3 -m json.tool
```

### API Documentation:
Open in browser: https://clean-hornets-laugh.loca.lt/docs

---

## 🛑 Stop All Services

```bash
pkill -f uvicorn && pkill -f localtunnel
```

---

## 🔄 Restart Everything (If Needed)

If you need to restart all services:

```bash
bash /home/minnal/source/LegendLift/start_all.sh
```

This will:
1. Stop all existing processes
2. Start backend server
3. Create new tunnel
4. Update mobile app configuration
5. Show you the commands to start mobile app

---

## ⚠️ Important Notes

### Tunnel URL Changes:
- The tunnel URL (`https://clean-hornets-laugh.loca.lt`) changes each time you restart
- Mobile app is already configured with current tunnel URL
- If you restart backend, update mobile app config at:
  `legendlift-mobile/src/constants/index.js`

### Network Issues:
If mobile app can't connect:
1. Make sure you're on the same WiFi network (for localhost testing)
2. Use the tunnel URL (already configured) for physical devices
3. Check that backend is running: `curl http://localhost:9000/`
4. Check tunnel is working: `curl https://clean-hornets-laugh.loca.lt/`

### Expo DevTools:
- Will open automatically at http://localhost:19002
- Shows logs, device connections, and build status
- Use to debug mobile app issues

---

## 📋 Process Check

Check if services are running:

```bash
# Check backend
curl -s http://localhost:9000/ && echo "✅ Backend OK"

# Check tunnel
curl -s https://clean-hornets-laugh.loca.lt/ \
  -H "Bypass-Tunnel-Reminder: true" && echo "✅ Tunnel OK"

# Check process IDs
echo "Backend PID: $(pgrep -f 'uvicorn.*app.main')"
echo "Tunnel PID: $(pgrep -f 'localtunnel')"
```

---

## 🎨 Theme Applied

✅ Modern Purple Gradient Theme
✅ Login Screen Redesigned
✅ Admin Dashboard Updated
✅ All Components Modernized

---

## 📱 Mobile App Features

### Admin Dashboard:
- View all customers (212 records)
- Manage services (257 records)
- View statistics and alerts
- Manage technicians
- View reports

### Technician Dashboard:
- Today's services
- Service history
- Check-in/check-out
- Service reports
- GPS tracking

---

## 💡 Quick Tips

1. **First Time Setup**: The mobile app might take 30-60 seconds to load initially
2. **Cache Issues**: If you see old theme, shake device and tap "Reload"
3. **Login Issues**: Make sure tunnel URL is accessible
4. **Slow Loading**: Normal for first load, subsequent loads are faster
5. **QR Code Issues**: Make sure camera has permission to scan

---

## 🐛 Troubleshooting

### Mobile app won't connect:
```bash
# Test tunnel manually
curl https://clean-hornets-laugh.loca.lt/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Bypass-Tunnel-Reminder: true" \
  -X POST \
  -d '{"email":"admin@legendlift.com","password":"admin123","role":"admin"}'
```

### Backend not responding:
```bash
cd /home/minnal/source/LegendLift/legendlift-backend
tail -f backend.log
```

### Tunnel not working:
```bash
cat /home/minnal/source/LegendLift/legendlift-backend/localtunnel.log
```

---

## ✅ Current Status

- [x] Backend Running (Port 9000)
- [x] Tunnel Active (https://clean-hornets-laugh.loca.lt)
- [x] Mobile App Configured
- [ ] Mobile App Started ← **YOU ARE HERE**

**Next Step**: Run `npm start` in legendlift-mobile directory! 🚀

---

*Generated: November 25, 2025*
