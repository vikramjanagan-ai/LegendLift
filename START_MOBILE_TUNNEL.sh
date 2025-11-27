#!/bin/bash

echo "=========================================="
echo "📱 Starting LegendLift Mobile App in TUNNEL Mode"
echo "=========================================="
echo ""

cd /home/minnal/source/LegendLift/legendlift-mobile

echo "🚀 Starting Expo with Tunnel (ngrok)..."
echo ""
echo "This will:"
echo "  1. Start Metro Bundler"
echo "  2. Create ngrok tunnel"
echo "  3. Show QR code in browser"
echo "  4. Allow access from any network"
echo ""
echo "⏳ Starting... (this takes 10-20 seconds)"
echo ""

npx expo start --tunnel

echo ""
echo "=========================================="
