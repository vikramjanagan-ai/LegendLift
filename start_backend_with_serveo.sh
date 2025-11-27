#!/bin/bash
# Start backend with serveo.net SSH tunnel (alternative to localtunnel)

echo "Starting backend with serveo.net tunnel..."
echo ""
echo "This will create a public URL using SSH tunnel"
echo ""

# Start SSH tunnel in background
ssh -o StrictHostKeyChecking=no -R 80:localhost:9000 serveo.net > serveo.log 2>&1 &
TUNNEL_PID=$!

echo "Tunnel PID: $TUNNEL_PID"
sleep 5

# Extract URL from log
TUNNEL_URL=$(grep -oP 'https://[a-z0-9]+\.serveo\.net' serveo.log | head -1)

if [ -n "$TUNNEL_URL" ]; then
    echo "✅ Tunnel created: $TUNNEL_URL"
    echo ""
    echo "Update mobile app with:"
    echo "  BASE_URL: '$TUNNEL_URL/api/v1'"
else
    echo "⚠️  Tunnel URL not found yet. Check serveo.log"
fi
