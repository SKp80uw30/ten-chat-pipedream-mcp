FROM node:20-alpine AS builder

WORKDIR /app

# Copy TEN Framework playground (latest via submodule)
COPY ../../ten-framework/ai_agents/playground/ ./
COPY ../../jitsi-integration/ ./src/jitsi-integration/

# Install dependencies and build
RUN npm install && npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

# Install system dependencies and Doppler CLI
RUN apk add --no-cache curl bash && \
    curl -Ls https://cli.doppler.com/install.sh | sh

# Copy built application
COPY --from=builder /app ./

# Create health check endpoint
COPY src/health.js ./src/

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start with environment loading
CMD ["sh", "-c", "eval \"$(doppler secrets download --no-file --format=export --project=ten-chat-pipedream-mcp --config=prd)\" && npm start -- --hostname 0.0.0.0 --port $PORT"]