#!/bin/bash

set -e

echo "🔧 Setting up Doppler configurations for modular Railway deployment..."

PROJECT="ten-chat-pipedream-mcp"

# Create service-specific configs if they don't exist
echo "Creating Doppler configurations..."

doppler configs create frontend-prd --project $PROJECT --description "Frontend service production config" || echo "Frontend config already exists"
doppler configs create mcp-server-prd --project $PROJECT --description "MCP server production config" || echo "MCP server config already exists"  
doppler configs create jitsi-meet-prd --project $PROJECT --description "Jitsi Meet production config" || echo "Jitsi config already exists"
doppler configs create shared-prd --project $PROJECT --description "Shared cross-service config" || echo "Shared config already exists"

# Set shared variables (used across services)
echo "Setting shared environment variables..."
doppler secrets set NODE_ENV="production" --project $PROJECT --config shared-prd
doppler secrets set APP_NAME="ten-chat-pipedream-mcp" --project $PROJECT --config shared-prd
doppler secrets set JWT_SECRET="$(openssl rand -base64 32)" --project $PROJECT --config shared-prd

# Frontend service specific variables
echo "Setting frontend service variables..."
doppler secrets set OPENAI_API_KEY="${OPENAI_API_KEY:-placeholder}" --project $PROJECT --config frontend-prd
doppler secrets set DEEPGRAM_API_KEY="${DEEPGRAM_API_KEY:-placeholder}" --project $PROJECT --config frontend-prd
doppler secrets set OPENAI_TTS_MODEL="tts-1" --project $PROJECT --config frontend-prd
doppler secrets set OPENAI_TTS_VOICE="alloy" --project $PROJECT --config frontend-prd

# Service URLs (will be updated after deployment)
doppler secrets set MCP_SERVER_URL="https://mcp-server-production.railway.app" --project $PROJECT --config frontend-prd
doppler secrets set JITSI_DOMAIN="jitsi-meet-production.railway.app" --project $PROJECT --config frontend-prd
doppler secrets set JITSI_ROOM_PREFIX="ten-agent" --project $PROJECT --config frontend-prd

# MCP server specific variables  
echo "Setting MCP server variables..."
doppler secrets set PIPEDREAM_API_KEY="${PIPEDREAM_API_KEY:-placeholder}" --project $PROJECT --config mcp-server-prd
doppler secrets set PIPEDREAM_PROJECT_ID="${PIPEDREAM_PROJECT_ID:-placeholder}" --project $PROJECT --config mcp-server-prd
doppler secrets set OPENAI_API_KEY="${OPENAI_API_KEY:-placeholder}" --project $PROJECT --config mcp-server-prd

# Jitsi Meet specific variables
echo "Setting Jitsi Meet variables..."
doppler secrets set ENABLE_LETSENCRYPT="1" --project $PROJECT --config jitsi-meet-prd
doppler secrets set ENABLE_HTTP_REDIRECT="1" --project $PROJECT --config jitsi-meet-prd
doppler secrets set JITSI_WEB_CONFIG_resolution="720" --project $PROJECT --config jitsi-meet-prd
doppler secrets set JITSI_WEB_CONFIG_startWithAudioMuted="false" --project $PROJECT --config jitsi-meet-prd
doppler secrets set JITSI_WEB_CONFIG_startWithVideoMuted="true" --project $PROJECT --config jitsi-meet-prd

echo "✅ Doppler configuration complete!"
echo ""
echo "Next steps:"
echo "1. Update placeholder API keys with real values:"
echo "   doppler secrets set OPENAI_API_KEY=\"your-key\" --project $PROJECT --config frontend-prd"
echo "   doppler secrets set DEEPGRAM_API_KEY=\"your-key\" --project $PROJECT --config frontend-prd"
echo "   doppler secrets set PIPEDREAM_API_KEY=\"your-key\" --project $PROJECT --config mcp-server-prd"
echo "   doppler secrets set PIPEDREAM_PROJECT_ID=\"your-id\" --project $PROJECT --config mcp-server-prd"
echo ""
echo "2. Deploy services with: ./shared/scripts/deploy.sh"