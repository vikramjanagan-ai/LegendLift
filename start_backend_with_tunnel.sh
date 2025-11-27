#!/bin/bash

echo "=========================================="
echo "🚀 LEGENDLIFT BACKEND - AUTO-CONFIG START"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /home/minnal/source/LegendLift/legendlift-backend

# Step 1: Stop existing services
echo -e "${BLUE}Step 1: Stopping existing services...${NC}"
pkill -f "uvicorn" 2>/dev/null
pkill -f "localtunnel" 2>/dev/null
sleep 2
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Step 2: Start backend
echo -e "${BLUE}Step 2: Starting backend on port 9000...${NC}"
nohup python run.py > backend.log 2>&1 &
sleep 4

if curl -s http://localhost:9000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running at http://localhost:9000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend starting... (may take a few seconds)${NC}"
fi
echo ""

# Step 3: Start tunnel
echo -e "${BLUE}Step 3: Creating tunnel...${NC}"
nohup npx localtunnel --port 9000 > localtunnel.log 2>&1 &
sleep 6

# Extract tunnel URL
TUNNEL_URL=$(grep -oP 'https://[a-z-]+\.loca\.lt' localtunnel.log | tail -1)

if [ -z "$TUNNEL_URL" ]; then
    echo -e "${YELLOW}⚠️  Waiting for tunnel...${NC}"
    sleep 3
    TUNNEL_URL=$(grep -oP 'https://[a-z-]+\.loca\.lt' localtunnel.log | tail -1)
fi

if [ -n "$TUNNEL_URL" ]; then
    echo -e "${GREEN}✅ Tunnel URL: $TUNNEL_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Could not get tunnel URL. Check localtunnel.log${NC}"
    exit 1
fi
echo ""

# Step 4: Auto-update mobile config
echo -e "${BLUE}Step 4: Auto-updating mobile app config...${NC}"
MOBILE_CONFIG="/home/minnal/source/LegendLift/legendlift-mobile/src/constants/index.js"

if [ -f "$MOBILE_CONFIG" ]; then
    # Backup current config
    cp "$MOBILE_CONFIG" "${MOBILE_CONFIG}.backup"

    # Update the BASE_URL with new tunnel URL
    sed -i "s|BASE_URL: 'https://[^']*'|BASE_URL: '${TUNNEL_URL}/api/v1'|g" "$MOBILE_CONFIG"

    echo -e "${GREEN}✅ Mobile config updated!${NC}"
    echo -e "   File: $MOBILE_CONFIG"
    echo -e "   URL:  ${TUNNEL_URL}/api/v1"
else
    echo -e "${YELLOW}⚠️  Mobile config not found${NC}"
fi
echo ""

# Step 5: Show status
echo "=========================================="
echo -e "${GREEN}✅ BACKEND STARTED WITH AUTO-CONFIG!${NC}"
echo "=========================================="
echo ""
echo "📊 Backend URLs:"
echo "   Local:  http://localhost:9000"
echo "   Tunnel: $TUNNEL_URL"
echo "   Docs:   $TUNNEL_URL/docs"
echo ""
echo "📱 Mobile App:"
echo "   Config: Auto-updated ✓"
echo "   API:    ${TUNNEL_URL}/api/v1"
echo ""
echo "🔐 Login:"
echo "   Admin: admin@legendlift.com / admin123"
echo ""
echo "🛑 To stop:"
echo "   pkill -f uvicorn && pkill -f localtunnel"
echo ""
echo "=========================================="

# Save tunnel URL for reference
echo "$TUNNEL_URL" > /home/minnal/source/LegendLift/CURRENT_TUNNEL_URL.txt
echo "Tunnel URL saved to: CURRENT_TUNNEL_URL.txt"
