#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service URLs (can be overridden by environment variables)
FRONTEND_URL="${FRONTEND_URL:-https://frontend-production.railway.app}"
MCP_SERVER_URL="${MCP_SERVER_URL:-https://mcp-server-production.railway.app}"
JITSI_URL="${JITSI_URL:-https://jitsi-meet-production.railway.app}"

echo -e "${BLUE}🏥 Railway Service Health Check${NC}"
echo "=================================="
echo ""

# Function to check service health
check_service() {
    local service_name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Checking $service_name... "
    
    if response=$(curl -s -w "%{http_code}" --max-time 30 "$url" 2>/dev/null); then
        http_code="${response: -3}"
        if [ "$http_code" = "$expected_status" ]; then
            echo -e "${GREEN}✅ Healthy (HTTP $http_code)${NC}"
            return 0
        else
            echo -e "${RED}❌ Unhealthy (HTTP $http_code)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Unreachable${NC}"
        return 1
    fi
}

# Function to check detailed service health
check_detailed_health() {
    local service_name="$1"
    local health_url="$2"
    
    echo ""
    echo -e "${BLUE}📊 $service_name Detailed Health:${NC}"
    echo "----------------------------------------"
    
    if health_data=$(curl -s --max-time 15 "$health_url" 2>/dev/null); then
        if command -v jq >/dev/null 2>&1; then
            echo "$health_data" | jq '.' 2>/dev/null || echo "$health_data"
        else
            echo "$health_data"
        fi
    else
        echo -e "${RED}Failed to retrieve detailed health information${NC}"
    fi
}

# Function to test inter-service communication
test_service_communication() {
    echo ""
    echo -e "${BLUE}🔗 Testing Inter-Service Communication:${NC}"
    echo "---------------------------------------------"
    
    # Test MCP Server tools endpoint
    echo -n "MCP Server tools endpoint... "
    if curl -s --max-time 15 "$MCP_SERVER_URL/tools" | grep -q "tools"; then
        echo -e "${GREEN}✅ Working${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
    
    # Test Jitsi external API
    echo -n "Jitsi external API... "
    if curl -s --max-time 15 "$JITSI_URL/external_api.js" | grep -q "JitsiMeetExternalAPI"; then
        echo -e "${GREEN}✅ Working${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
    
    # Test Jitsi configuration
    echo -n "Jitsi TEN Framework config... "
    if curl -s --max-time 15 "$JITSI_URL/config.js" | grep -q "enableWelcomePage.*false"; then
        echo -e "${GREEN}✅ Optimized${NC}"
    else
        echo -e "${YELLOW}⚠️ May need optimization${NC}"
    fi
}

# Function to check environment variables
check_environment() {
    echo ""
    echo -e "${BLUE}🌍 Environment Configuration:${NC}"
    echo "--------------------------------------"
    
    # Check frontend environment
    echo -n "Frontend Doppler config... "
    if frontend_health=$(curl -s --max-time 15 "$FRONTEND_URL/api/health" 2>/dev/null); then
        if echo "$frontend_health" | grep -q "doppler_project.*ten-chat-pipedream-mcp"; then
            echo -e "${GREEN}✅ Connected${NC}"
        else
            echo -e "${RED}❌ Not configured${NC}"
        fi
    else
        echo -e "${RED}❌ Cannot check${NC}"
    fi
    
    # Check MCP server environment  
    echo -n "MCP Server Doppler config... "
    if mcp_health=$(curl -s --max-time 15 "$MCP_SERVER_URL/health" 2>/dev/null); then
        if echo "$mcp_health" | grep -q "doppler_project.*ten-chat-pipedream-mcp"; then
            echo -e "${GREEN}✅ Connected${NC}"
        else
            echo -e "${RED}❌ Not configured${NC}"
        fi
    else
        echo -e "${RED}❌ Cannot check${NC}"
    fi
    
    # Check API key configuration
    echo -n "API keys configured... "
    if echo "$mcp_health" | grep -q "api_key_configured.*true"; then
        echo -e "${GREEN}✅ Configured${NC}"
    else
        echo -e "${RED}❌ Missing API keys${NC}"
    fi
}

# Main health check sequence
echo -e "${BLUE}🔍 Basic Service Availability:${NC}"
echo "------------------------------------"

# Track overall health
overall_health=0

# Check each service
if ! check_service "Frontend Service" "$FRONTEND_URL"; then
    overall_health=1
fi

if ! check_service "MCP Server" "$MCP_SERVER_URL/health"; then
    overall_health=1
fi

if ! check_service "Jitsi Meet" "$JITSI_URL"; then
    overall_health=1
fi

# If basic checks pass, run detailed checks
if [ $overall_health -eq 0 ]; then
    check_detailed_health "Frontend" "$FRONTEND_URL/api/health"
    check_detailed_health "MCP Server" "$MCP_SERVER_URL/health"
    
    test_service_communication
    check_environment
fi

# Summary
echo ""
echo "=================================="
if [ $overall_health -eq 0 ]; then
    echo -e "${GREEN}🎉 All services are healthy!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Application URLs:${NC}"
    echo "Frontend: $FRONTEND_URL"
    echo "MCP Server: $MCP_SERVER_URL"
    echo "Jitsi Meet: $JITSI_URL"
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo "1. Test voice interaction in the frontend"
    echo "2. Verify MCP tools are working with Pipedream"
    echo "3. Test Jitsi Meet WebRTC functionality"
else
    echo -e "${RED}❌ Some services are unhealthy${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
    echo "1. Check Railway deployment logs: railway logs --follow"
    echo "2. Verify Doppler environment variables: doppler secrets"
    echo "3. Check service configurations in Railway dashboard"
    echo "4. Review Docker container status and resource usage"
    exit 1
fi