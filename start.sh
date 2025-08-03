#!/bin/bash

# Railway port configuration
export PORT=${PORT:-49483}

echo "Starting TEN Agent with port: $PORT"

# Doppler integration - load environment variables
if command -v doppler > /dev/null 2>&1; then
    echo "Loading environment variables from Doppler..."
    eval "$(doppler secrets download --no-file --format=export --project=ten-chat-pipedream-mcp --config=prd)"
else
    echo "Warning: Doppler CLI not found, using local environment variables"
fi

# Set environment variables for TEN Agent (loaded from Doppler)
export AGORA_APP_ID=${AGORA_APP_ID}
export AGORA_APP_CERTIFICATE=${AGORA_APP_CERTIFICATE}
export OPENAI_API_KEY=${OPENAI_API_KEY}
export OPENAI_TTS_MODEL=${OPENAI_TTS_MODEL:-tts-1}
export OPENAI_TTS_VOICE=${OPENAI_TTS_VOICE:-alloy}
export DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
export PIPEDREAM_API_KEY=${PIPEDREAM_API_KEY}
export PIPEDREAM_PROJECT_ID=${PIPEDREAM_PROJECT_ID}
export MCP_SERVER_URL=${MCP_SERVER:-https://remote.mcp.pipedream.net}
export JWT_SECRET=${JWT_SECRET}

# Validate required environment variables
required_vars=(
    "AGORA_APP_ID"
    "AGORA_APP_CERTIFICATE" 
    "OPENAI_API_KEY"
    "DEEPGRAM_API_KEY"
    "PIPEDREAM_API_KEY"
    "PIPEDREAM_PROJECT_ID"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "$(eval echo \$$var)" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    echo "Please set these in your Doppler project: ten-chat-pipedream-mcp"
    exit 1
fi

echo "✅ All required environment variables are set!"

# Start the TEN Agent playground
cd playground && npm start -- --hostname 0.0.0.0 --port $PORT