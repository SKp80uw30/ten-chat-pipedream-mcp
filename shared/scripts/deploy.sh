#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Railway Modular Deployment Script${NC}"
echo "====================================="
echo ""

# Configuration
PROJECT_NAME="ten-chat-pipedream-mcp"
SERVICES=("mcp-server" "jitsi" "frontend")

# Function to check if Railway CLI is installed and authenticated
check_railway_auth() {
    echo -n "Checking Railway authentication... "
    if ! command -v railway >/dev/null 2>&1; then
        echo -e "${RED}❌ Railway CLI not installed${NC}"
        echo "Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    if ! railway whoami >/dev/null 2>&1; then
        echo -e "${RED}❌ Not logged in to Railway${NC}"
        echo "Login with: railway login"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Authenticated${NC}"
}

# Function to check if Doppler is configured
check_doppler_config() {
    echo -n "Checking Doppler configuration... "
    if ! command -v doppler >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ Doppler CLI not found - environment variables may not load${NC}"
        return 1
    fi
    
    if ! doppler projects get $PROJECT_NAME >/dev/null 2>&1; then
        echo -e "${RED}❌ Doppler project '$PROJECT_NAME' not found${NC}"
        echo "Set up with: ./shared/doppler-configs/setup-doppler.sh"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Configured${NC}"
}

# Function to update dependencies before deployment
update_dependencies() {
    echo ""
    echo -e "${BLUE}📦 Updating dependencies to latest versions...${NC}"
    echo "----------------------------------------------------"
    
    if [ -f "./shared/scripts/update-dependencies.sh" ]; then
        ./shared/scripts/update-dependencies.sh
    else
        echo -e "${YELLOW}⚠️ Update script not found - deploying with current versions${NC}"
    fi
}

# Function to create or link to Railway project  
setup_railway_project() {
    echo ""
    echo -e "${BLUE}🏗️ Setting up Railway project...${NC}"
    echo "-----------------------------------"
    
    # Check if already linked to a project
    if railway status >/dev/null 2>&1; then
        local current_project=$(railway status | grep "Project:" | awk '{print $2}')
        echo "Already linked to project: $current_project"
        
        if [ "$current_project" != "$PROJECT_NAME" ]; then
            echo -e "${YELLOW}⚠️ Linked to different project. Consider running 'railway unlink' first.${NC}"
        fi
    else
        echo "Creating or linking to Railway project..."
        railway init --name $PROJECT_NAME || echo "Project may already exist"
    fi
}

# Function to deploy a specific service
deploy_service() {
    local service_name="$1"
    local service_dir="services/$service_name"
    
    echo ""
    echo -e "${BLUE}🚢 Deploying $service_name service...${NC}"
    echo "----------------------------------------"
    
    if [ ! -d "$service_dir" ]; then
        echo -e "${RED}❌ Service directory $service_dir not found${NC}"
        return 1
    fi
    
    # Create service if it doesn't exist
    echo "Creating Railway service for $service_name..."
    railway service create $service_name || echo "Service may already exist"
    
    # Deploy from service directory
    echo "Deploying $service_name..."
    cd "$service_dir"
    
    # Link to the specific service
    railway service connect $service_name || echo "Service connection may already exist"
    
    # Deploy the service
    railway up --detach
    
    cd - >/dev/null
    
    echo -e "${GREEN}✅ $service_name deployment initiated${NC}"
}

# Function to wait for deployments to complete
wait_for_deployments() {
    echo ""
    echo -e "${BLUE}⏳ Waiting for deployments to complete...${NC}"
    echo "--------------------------------------------"
    
    local max_wait=600  # 10 minutes
    local wait_time=0
    local check_interval=30
    
    while [ $wait_time -lt $max_wait ]; do
        echo "Checking deployment status... (${wait_time}s elapsed)"
        
        local all_healthy=true
        
        for service in "${SERVICES[@]}"; do
            # Check if service is deployed and healthy
            if ! railway logs --service $service --num 1 | grep -q "started\|ready\|listening" 2>/dev/null; then
                all_healthy=false
                break
            fi
        done
        
        if [ "$all_healthy" = true ]; then
            echo -e "${GREEN}✅ All services appear to be deployed${NC}"
            break
        fi
        
        sleep $check_interval
        wait_time=$((wait_time + check_interval))
    done
    
    if [ $wait_time -ge $max_wait ]; then
        echo -e "${YELLOW}⚠️ Deployment check timed out - services may still be starting${NC}"
    fi
}

# Function to get service URLs
get_service_urls() {
    echo ""
    echo -e "${BLUE}🌐 Service URLs:${NC}"
    echo "-------------------"
    
    for service in "${SERVICES[@]}"; do
        echo -n "$service: "
        if url=$(railway domain --service $service 2>/dev/null); then
            echo -e "${GREEN}https://$url${NC}"
        else
            echo -e "${YELLOW}URL not available yet${NC}"
        fi
    done
}

# Function to update Doppler with service URLs
update_service_urls() {
    echo ""
    echo -e "${BLUE}🔧 Updating service URLs in Doppler...${NC}"
    echo "--------------------------------------------"
    
    # Get service URLs
    local mcp_url=$(railway domain --service mcp-server 2>/dev/null || echo "mcp-server-production.railway.app")
    local jitsi_url=$(railway domain --service jitsi 2>/dev/null || echo "jitsi-meet-production.railway.app")
    
    # Update frontend configuration with service URLs
    if command -v doppler >/dev/null 2>&1; then
        echo "Updating MCP_SERVER_URL..."
        doppler secrets set MCP_SERVER_URL="https://$mcp_url" --project $PROJECT_NAME --config frontend-prd || echo "Could not update MCP_SERVER_URL"
        
        echo "Updating JITSI_DOMAIN..."
        doppler secrets set JITSI_DOMAIN="$jitsi_url" --project $PROJECT_NAME --config frontend-prd || echo "Could not update JITSI_DOMAIN"
        
        echo -e "${GREEN}✅ Service URLs updated in Doppler${NC}"
    else
        echo -e "${YELLOW}⚠️ Doppler CLI not available - URLs not updated${NC}"
        echo "Manual update required:"
        echo "  MCP_SERVER_URL=https://$mcp_url"
        echo "  JITSI_DOMAIN=$jitsi_url"
    fi
}

# Function to run post-deployment health checks
run_health_checks() {
    echo ""
    echo -e "${BLUE}🏥 Running health checks...${NC}"
    echo "------------------------------"
    
    if [ -f "./shared/scripts/health-check.sh" ]; then
        # Set service URLs for health check
        export FRONTEND_URL="https://$(railway domain --service frontend 2>/dev/null || echo 'frontend-production.railway.app')"
        export MCP_SERVER_URL="https://$(railway domain --service mcp-server 2>/dev/null || echo 'mcp-server-production.railway.app')"
        export JITSI_URL="https://$(railway domain --service jitsi 2>/dev/null || echo 'jitsi-meet-production.railway.app')"
        
        ./shared/scripts/health-check.sh
    else
        echo -e "${YELLOW}⚠️ Health check script not found${NC}"
        echo "Manual verification recommended"
    fi
}

# Main deployment flow
main() {
    echo "Starting deployment of $PROJECT_NAME to Railway..."
    echo "Services to deploy: ${SERVICES[*]}"
    echo ""
    
    # Pre-deployment checks
    check_railway_auth
    check_doppler_config
    
    # Confirm deployment
    if [ "$1" != "--skip-confirmation" ]; then
        echo ""
        echo -e "${YELLOW}⚠️ This will deploy all services to Railway production.${NC}"
        echo -n "Continue? (y/N) "
        read -r confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Update dependencies
    if [ "$1" != "--skip-updates" ]; then
        update_dependencies
    fi
    
    # Setup Railway project
    setup_railway_project
    
    # Deploy each service in dependency order
    # 1. MCP Server (no dependencies)
    deploy_service "mcp-server"
    
    # 2. Jitsi Meet (no dependencies)  
    deploy_service "jitsi"
    
    # 3. Frontend (depends on MCP Server and Jitsi)
    deploy_service "frontend"
    
    # Wait for deployments
    wait_for_deployments
    
    # Update service URLs
    update_service_urls
    
    # Redeploy frontend with updated URLs
    echo ""
    echo -e "${BLUE}🔄 Redeploying frontend with updated service URLs...${NC}"
    cd services/frontend
    railway up --detach
    cd - >/dev/null
    
    # Get final URLs
    get_service_urls
    
    # Run health checks
    run_health_checks
    
    # Success message
    echo ""
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Test the voice AI interface in your browser"
    echo "2. Verify MCP tools are working with Pipedream workflows"
    echo "3. Test Jitsi Meet WebRTC functionality"
    echo "4. Monitor logs: railway logs --follow"
    echo ""
    echo -e "${BLUE}Troubleshooting:${NC}"
    echo "- View logs: railway logs --service <service-name>"
    echo "- Check health: ./shared/scripts/health-check.sh"
    echo "- Update dependencies: ./shared/scripts/update-dependencies.sh"
}

# Script entry point
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi