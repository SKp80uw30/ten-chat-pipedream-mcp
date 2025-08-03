# Environment Variables for 'ten-chat-pipedream-mcp' Doppler Project

## Core Application Variables

### Railway Deployment
```bash
# Railway automatically sets this, but you can override
PORT=49483
NODE_ENV=production
```

### Application Configuration
```bash
# Application identification
APP_NAME=ten-chat-pipedream-mcp
APP_VERSION=1.0.0
APP_ENVIRONMENT=production

# Health check configuration
HEALTH_CHECK_ENDPOINT=/health
HEALTH_CHECK_TIMEOUT=10000
```

## Required Service API Keys

### 🎥 Agora (Real-time Communication) - REQUIRED
```bash
# Get from: https://console.agora.io/
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here

# Optional Agora settings
AGORA_REGION=global
AGORA_LOG_LEVEL=info
```

### 🤖 OpenAI (Language Model + Text-to-Speech) - REQUIRED
```bash
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional OpenAI LLM settings
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
OPENAI_BASE_URL=https://api.openai.com/v1

# OpenAI TTS Configuration - REQUIRED
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=alloy
OPENAI_TTS_SPEED=1.0
OPENAI_TTS_RESPONSE_FORMAT=mp3
```

### 🎤 Deepgram (Speech Recognition) - REQUIRED
```bash
# Get from: https://console.deepgram.com/
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Optional Deepgram settings
DEEPGRAM_MODEL=nova-2
DEEPGRAM_LANGUAGE=en-US
DEEPGRAM_TIER=nova
```

### 🔊 Text-to-Speech Options

#### Option 1: OpenAI TTS (Recommended - High Quality, Cost Effective)
```bash
# Uses the same OPENAI_API_KEY as above
# Additional TTS-specific settings
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=alloy
OPENAI_TTS_SPEED=1.0
OPENAI_TTS_RESPONSE_FORMAT=mp3

# Available voices: alloy, echo, fable, onyx, nova, shimmer
# Available models: tts-1 (faster), tts-1-hd (higher quality)
```

#### Option 2: ElevenLabs TTS (Optional - Premium Quality, More Expensive)
```bash
# Get from: https://elevenlabs.io/speech-synthesis
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional ElevenLabs settings
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL_ID=eleven_monolingual_v1
ELEVENLABS_STABILITY=0.5
ELEVENLABS_SIMILARITY_BOOST=0.5
```

## Pipedream MCP Integration - REQUIRED

### 🔗 Pipedream API Configuration
```bash
# Get from: https://pipedream.com/settings/account
PIPEDREAM_API_KEY=your_pipedream_api_key_here

# Get from your Pipedream project dashboard
PIPEDREAM_PROJECT_ID=your_pipedream_project_id_here

# Pipedream workspace/organization (if applicable)
PIPEDREAM_WORKSPACE_ID=your_workspace_id_here

# Pipedream OAuth credentials (for user authentication)
PIPEDREAM_CLIENT_ID=your_pipedream_client_id
PIPEDREAM_CLIENT_SECRET=your_pipedream_client_secret

# MCP Server Configuration
MCP_SERVER_URL=https://your-pipedream-mcp-server.railway.app
MCP_SERVER_PORT=8080
MCP_SERVER_TIMEOUT=30000
```

## Optional Enhancement Variables

### 🎨 Avatar Integration (Trulience)
```bash
# Get from: https://trulience.com/
TRULIENCE_AVATAR_ID=your_avatar_id_here
TRULIENCE_API_TOKEN=your_trulience_token_here
TRULIENCE_BASE_URL=https://api.trulience.com
```

### 🌤️ Weather Service (OpenWeatherMap)
```bash
# Get from: https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweather_api_key_here
OPENWEATHER_UNITS=metric
OPENWEATHER_LANG=en
```

### 🔍 Web Search (Brave Search API)
```bash
# Get from: https://brave.com/search/api/
BRAVE_SEARCH_API_KEY=your_brave_search_api_key_here
BRAVE_SEARCH_COUNTRY=US
BRAVE_SEARCH_LANGUAGE=en
```

### 🗄️ Database Configuration (Optional)
```bash
# PostgreSQL for conversation history
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ten_chat_history
POSTGRES_USER=ten_user
POSTGRES_PASSWORD=secure_password_here

# Redis for session management
REDIS_URL=redis://username:password@host:port
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_here
```

## Security & Authentication

### 🔐 Application Security
```bash
# JWT for session management
JWT_SECRET=your_very_long_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# API rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS configuration
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true
```

### 🛡️ API Security Keys
```bash
# Optional API key for your application
API_KEY=your_custom_api_key_for_access
API_KEY_HEADER=X-API-Key

# Webhook signatures (if using webhooks)
WEBHOOK_SECRET=your_webhook_secret_here
```

## Development & Debugging

### 🐛 Logging & Monitoring
```bash
# Logging configuration
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_REQUEST_LOGGING=true

# Error tracking (Sentry - optional)
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production

# Performance monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

### 🧪 Development Settings
```bash
# Development overrides (set only in dev environment)
DEBUG=false
DEVELOPMENT_MODE=false
MOCK_EXTERNAL_APIS=false

# Local development ports
DEV_PORT=3000
DEV_MCP_PORT=8081
```

## TEN Framework Specific

### 🎯 TEN Agent Configuration
```bash
# TEN Framework settings
TEN_AGENT_NAME=voice-mcp-agent
TEN_AGENT_VERSION=1.0.0
TEN_LOG_LEVEL=info

# Extension configuration
TEN_EXTENSIONS_PATH=/app/extensions
TEN_CONFIG_PATH=/app/config

# Graph configuration file
TEN_GRAPH_CONFIG=voice_assistant_graph.json
TEN_PROPERTY_CONFIG=property.json
```

### 🔧 TEN Runtime Settings
```bash
# Memory and performance settings
TEN_MAX_MEMORY=2048
TEN_WORKER_THREADS=4
TEN_ENABLE_PROFILING=false

# Audio processing settings
TEN_AUDIO_SAMPLE_RATE=16000
TEN_AUDIO_CHANNELS=1
TEN_AUDIO_BUFFER_SIZE=1024
```

## Railway Specific Variables

### 🚀 Railway Platform
```bash
# Railway automatically provides these
RAILWAY_ENVIRONMENT=production
RAILWAY_PROJECT_ID=auto_generated
RAILWAY_SERVICE_ID=auto_generated
RAILWAY_REPLICA_ID=auto_generated

# Custom Railway settings
RAILWAY_DOCKERFILE_PATH=./Dockerfile
RAILWAY_HEALTHCHECK_PATH=/health
RAILWAY_DEPLOYMENT_OVERLAP_SECONDS=10
```

## Quick Setup Commands for Doppler

### Create Project and Environments
```bash
# Install Doppler CLI first
curl -Ls https://cli.doppler.com/install.sh | sh

# Login to Doppler
doppler login

# Create project
doppler projects create ten-chat-pipedream-mcp

# Create environments
doppler environments create dev --project ten-chat-pipedream-mcp
doppler environments create staging --project ten-chat-pipedream-mcp
doppler environments create production --project ten-chat-pipedream-mcp
```

### Set Required Variables (Production)
```bash
# Switch to production environment
doppler setup --project ten-chat-pipedream-mcp --config production

# Set core required variables
doppler secrets set AGORA_APP_ID="your_value"
doppler secrets set AGORA_APP_CERTIFICATE="your_value"
doppler secrets set OPENAI_API_KEY="your_value"
doppler secrets set DEEPGRAM_API_KEY="your_value"
doppler secrets set ELEVENLABS_API_KEY="your_value"
doppler secrets set PIPEDREAM_API_KEY="your_value"
doppler secrets set PIPEDREAM_PROJECT_ID="your_value"

# Set application variables
doppler secrets set NODE_ENV="production"
doppler secrets set APP_NAME="ten-chat-pipedream-mcp"
doppler secrets set JWT_SECRET="$(openssl rand -base64 32)"
```

### Integration with Railway
```bash
# Install Doppler Railway integration
# In your Railway dashboard:
# 1. Go to Variables tab
# 2. Click "Add Integration"
# 3. Select Doppler
# 4. Authenticate and select your project/environment
```

## Variable Priority Levels

### 🔴 CRITICAL (App won't start without these)
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `OPENAI_API_KEY` (used for both LLM and TTS)
- `DEEPGRAM_API_KEY`
- `PIPEDREAM_API_KEY`
- `PIPEDREAM_PROJECT_ID`

### 🟡 IMPORTANT (Core functionality)
- `JWT_SECRET`
- `MCP_SERVER_URL`
- `NODE_ENV`
- `PORT`
- `OPENAI_TTS_MODEL`
- `OPENAI_TTS_VOICE`

### 🟢 OPTIONAL (Enhanced features)
- `TRULIENCE_AVATAR_ID`
- `OPENWEATHER_API_KEY`
- `BRAVE_SEARCH_API_KEY`
- `DATABASE_URL`
- `SENTRY_DSN`

## Validation Script
```bash
#!/bin/bash
# Save as check-env.sh to validate all required variables are set

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
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "✅ All required environment variables are set!"
else
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi
```

## Notes
- Replace all `your_*_here` placeholders with actual values
- Store sensitive keys securely in Doppler
- Use different values for dev/staging/production environments
- Some variables are auto-generated by Railway/Doppler
- Keep API keys with appropriate permissions (read-only where possible)