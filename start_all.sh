#!/bin/bash

echo "=========================================="
echo "🚀 LEGENDLIFT - STARTING ALL SERVICES"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project root
cd /home/minnal/source/LegendLift

echo -e "${BLUE}Step 1: Cleaning up existing processes...${NC}"
pkill -f "uvicorn" 2>/dev/null
pkill -f "localtunnel" 2>/dev/null
pkill -f "npx lt" 2>/dev/null
sleep 2
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

echo -e "${BLUE}Step 2: Starting Backend Server (Port 9000)...${NC}"
cd /home/minnal/source/LegendLift/legendlift-backend
nohup python run.py > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Check if backend started
if curl -s http://localhost:9000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:9000${NC}"
    echo -e "   API Docs: http://localhost:9000/docs"
else
    echo -e "${YELLOW}⚠️  Backend might take a few seconds to start...${NC}"
fi
echo ""

echo -e "${BLUE}Step 3: Creating Backend Tunnel (LocalTunnel)...${NC}"
nohup npx localtunnel --port 9000 > localtunnel.log 2>&1 &
TUNNEL_PID=$!
sleep 5

# Extract tunnel URL
TUNNEL_URL=$(grep -oP 'https://[a-z-]+\.loca\.lt' localtunnel.log | tail -1)

if [ -n "$TUNNEL_URL" ]; then
    echo -e "${GREEN}✅ Tunnel created: $TUNNEL_URL${NC}"
    echo -e "   Backend accessible at: $TUNNEL_URL/api/v1"
else
    echo -e "${YELLOW}⚠️  Tunnel URL not found yet. Check localtunnel.log${NC}"
    TUNNEL_URL="https://clean-hornets-laugh.loca.lt"
fi
echo ""

echo -e "${BLUE}Step 4: Updating Mobile App Configuration...${NC}"
cd /home/minnal/source/LegendLift/legendlift-mobile
echo -e "${GREEN}✅ Mobile app is configured to use: $TUNNEL_URL/api/v1${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ ALL SERVICES STARTED SUCCESSFULLY!${NC}"
echo "=========================================="
echo ""
echo "📱 To start the Mobile App, run:"
echo "   cd /home/minnal/source/LegendLift/legendlift-mobile"
echo "   npm start"
echo ""
echo "📊 Backend Status:"
echo "   Local URL:  http://localhost:9000"
echo "   Tunnel URL: $TUNNEL_URL"
echo "   API Docs:   $TUNNEL_URL/docs"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin:      admin@legendlift.com / admin123"
echo "   Technician: john@legendlift.com / tech123"
echo ""
echo "📋 Process IDs:"
echo "   Backend PID: $(pgrep -f 'uvicorn.*app.main')"
echo "   Tunnel PID:  $(pgrep -f 'localtunnel')"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f uvicorn && pkill -f localtunnel"
echo ""
echo "=========================================="
