#!/bin/bash
# VN30-Quantum Production Deployment Script

set -e

echo "🚀 VN30-Quantum Deployment Script"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check environment
check_env() {
    echo -e "${YELLOW}📋 Checking environment...${NC}"
    
    if [ ! -f .env ]; then
        echo -e "${RED}❌ .env file not found!${NC}"
        echo "Copy .env.example to .env and fill in the values"
        exit 1
    fi
    
    # Source environment
    export $(cat .env | grep -v '^#' | xargs)
    
    echo -e "${GREEN}✅ Environment loaded${NC}"
}

# Pull latest code
pull_code() {
    echo -e "${YELLOW}📥 Pulling latest code...${NC}"
    git pull origin main
    echo -e "${GREEN}✅ Code updated${NC}"
}

# Build images
build_images() {
    echo -e "${YELLOW}🐳 Building Docker images...${NC}"
    docker-compose -f docker-compose.prod.yml build --parallel
    echo -e "${GREEN}✅ Images built${NC}"
}

# Run migrations
run_migrations() {
    echo -e "${YELLOW}📊 Running database migrations...${NC}"
    docker-compose -f docker-compose.prod.yml run --rm backend python -c "from database import init_db; init_db()"
    echo -e "${GREEN}✅ Migrations complete${NC}"
}

# Deploy services
deploy_services() {
    echo -e "${YELLOW}🚀 Deploying services...${NC}"
    docker-compose -f docker-compose.prod.yml up -d --remove-orphans
    echo -e "${GREEN}✅ Services deployed${NC}"
}

# Health check
health_check() {
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    sleep 10  # Wait for services to start
    
    # Check backend
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${GREEN}  ✅ Backend: Healthy${NC}"
    else
        echo -e "${RED}  ❌ Backend: Unhealthy${NC}"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}  ✅ Frontend: Healthy${NC}"
    else
        echo -e "${RED}  ❌ Frontend: Unhealthy${NC}"
    fi
    
    # Check InfluxDB
    if curl -s http://localhost:8086/health > /dev/null; then
        echo -e "${GREEN}  ✅ InfluxDB: Healthy${NC}"
    else
        echo -e "${RED}  ❌ InfluxDB: Unhealthy${NC}"
    fi
}

# Show status
show_status() {
    echo ""
    echo "=================================="
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "=================================="
    echo ""
    echo "📊 Service Status:"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    echo "🔗 URLs:"
    echo "  - Frontend: http://localhost:80"
    echo "  - API Docs: http://localhost:8000/docs"
    echo "  - Grafana:  http://localhost:3001"
    echo "  - InfluxDB: http://localhost:8086"
}

# Rollback
rollback() {
    echo -e "${YELLOW}⏪ Rolling back...${NC}"
    docker-compose -f docker-compose.prod.yml down
    git checkout HEAD~1
    docker-compose -f docker-compose.prod.yml up -d
    echo -e "${GREEN}✅ Rollback complete${NC}"
}

# Main
case "${1:-deploy}" in
    deploy)
        check_env
        pull_code
        build_images
        run_migrations
        deploy_services
        health_check
        show_status
        ;;
    rollback)
        rollback
        ;;
    status)
        show_status
        ;;
    build)
        build_images
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|build}"
        exit 1
        ;;
esac
