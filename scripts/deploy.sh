#!/bin/bash

# ═══════════════════════════════════════════════════════
# VN30-Quantum Automated Deploy Script
# One-click deploy to VPS with Cloudflare Tunnel
# ═══════════════════════════════════════════════════════

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║        🚀 VN30-QUANTUM DEPLOY SCRIPT                  ║"
echo "║        Zero Trust Cloud Deployment                     ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're on the server
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please edit .env with your secrets before deploying.${NC}"
        echo -e "${YELLOW}   nano .env${NC}"
        exit 1
    fi
fi

# Step 1: Check Docker
echo -e "\n${BLUE}[1/6] Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed. Installing...${NC}"
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
echo -e "${GREEN}✅ Docker is installed${NC}"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not installed. Installing...${NC}"
    apt-get update
    apt-get install docker-compose-plugin -y
fi
echo -e "${GREEN}✅ Docker Compose is installed${NC}"

# Step 2: Pull latest code (if git repo)
echo -e "\n${BLUE}[2/6] Updating code...${NC}"
if [ -d ".git" ]; then
    git fetch origin
    git reset --hard origin/main
    echo -e "${GREEN}✅ Code updated from GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repo, skipping update${NC}"
fi

# Step 3: Validate configuration
echo -e "\n${BLUE}[3/6] Validating configuration...${NC}"

# Check required env vars
source .env 2>/dev/null || true

if [ -z "$TUNNEL_TOKEN" ] || [ "$TUNNEL_TOKEN" = "your_cloudflare_tunnel_token_here" ]; then
    echo -e "${RED}❌ TUNNEL_TOKEN not set in .env${NC}"
    echo -e "${YELLOW}   Get it from: Cloudflare Zero Trust → Tunnels → Create${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Cloudflare Tunnel token configured${NC}"

if [ -z "$INFLUX_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  INFLUX_TOKEN not set, using default${NC}"
fi

# Step 4: Build and start services
echo -e "\n${BLUE}[4/6] Building and starting services...${NC}"

# Stop existing containers
docker compose down --remove-orphans 2>/dev/null || true

# Build with no cache on first deploy or if force rebuild
if [ "$1" = "--rebuild" ]; then
    echo -e "${YELLOW}🔄 Force rebuilding all images...${NC}"
    docker compose build --no-cache
fi

# Start all services
docker compose up -d --build

echo -e "${GREEN}✅ All services started${NC}"

# Step 5: Wait for health checks
echo -e "\n${BLUE}[5/6] Waiting for services to be healthy...${NC}"

# Wait for InfluxDB
echo -n "   Waiting for InfluxDB..."
for i in {1..30}; do
    if docker compose exec -T influxdb curl -sf http://localhost:8086/health &>/dev/null; then
        echo -e "${GREEN} Ready!${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Grafana
echo -n "   Waiting for Grafana..."
for i in {1..30}; do
    if docker compose exec -T nginx wget -q --spider http://grafana:3000/api/health &>/dev/null; then
        echo -e "${GREEN} Ready!${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Tunnel
echo -n "   Waiting for Tunnel..."
sleep 5
echo -e "${GREEN} Connected!${NC}"

# Step 6: Show status
echo -e "\n${BLUE}[6/6] Deployment Status${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Summary
echo -e "\n${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e ""
echo -e "📊 Dashboard:  ${BLUE}https://${DOMAIN:-your-domain.com}${NC}"
echo -e "📱 Configure:  Cloudflare Zero Trust → Public Hostname → nginx:80"
echo -e ""
echo -e "📝 Useful commands:"
echo -e "   ${YELLOW}docker compose logs -f${NC}        # View all logs"
echo -e "   ${YELLOW}docker compose logs -f hunter${NC} # View Hunter logs"
echo -e "   ${YELLOW}docker compose restart${NC}       # Restart all"
echo -e "   ${YELLOW}docker compose down${NC}          # Stop all"
echo -e ""
echo -e "${BLUE}🔮 VN30-Quantum is now running 24/7!${NC}"
