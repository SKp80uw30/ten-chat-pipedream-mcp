#!/bin/bash

set -e

echo "🎵 Starting Jitsi Meet with Doppler configuration..."

# Load environment variables from Doppler if available
if command -v doppler > /dev/null 2>&1; then
    echo "Loading environment variables from Doppler..."
    eval "$(doppler secrets download --no-file --format=export --project=ten-chat-pipedream-mcp --config=jitsi-meet-prd)" || echo "Warning: Could not load Doppler secrets"
fi

# Set Railway-specific configuration
export PUBLIC_URL=${RAILWAY_STATIC_URL:-$PUBLIC_URL}
export DOCKER_HOST_ADDRESS=${RAILWAY_STATIC_URL:-localhost}

# Configure Jitsi for Railway deployment
export ENABLE_LETSENCRYPT=${ENABLE_LETSENCRYPT:-1}
export ENABLE_HTTP_REDIRECT=${ENABLE_HTTP_REDIRECT:-1}
export ENABLE_HSTS=${ENABLE_HSTS:-1}
export DISABLE_HTTPS=${DISABLE_HTTPS:-0}

# Jitsi Web configuration
export JITSI_WEB_CONFIG_resolution=${JITSI_WEB_CONFIG_resolution:-720}
export JITSI_WEB_CONFIG_startWithAudioMuted=${JITSI_WEB_CONFIG_startWithAudioMuted:-false}
export JITSI_WEB_CONFIG_startWithVideoMuted=${JITSI_WEB_CONFIG_startWithVideoMuted:-true}
export JITSI_WEB_CONFIG_requireDisplayName=${JITSI_WEB_CONFIG_requireDisplayName:-false}

# Enable useful Jitsi features for TEN Framework integration
export JITSI_WEB_CONFIG_enableWelcomePage=${JITSI_WEB_CONFIG_enableWelcomePage:-false}
export JITSI_WEB_CONFIG_enableClosePage=${JITSI_WEB_CONFIG_enableClosePage:-false}
export JITSI_WEB_CONFIG_disableInviteFunctions=${JITSI_WEB_CONFIG_disableInviteFunctions:-true}
export JITSI_WEB_CONFIG_prejoinPageEnabled=${JITSI_WEB_CONFIG_prejoinPageEnabled:-false}

echo "✅ Jitsi configuration loaded"
echo "Public URL: ${PUBLIC_URL}"
echo "Docker Host: ${DOCKER_HOST_ADDRESS}"

# Start Jitsi Meet web container
exec /init