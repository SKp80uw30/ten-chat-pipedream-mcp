FROM node:20-alpine

WORKDIR /app

# Install system dependencies and Doppler CLI
RUN apk add --no-cache curl bash && \
    curl -Ls https://cli.doppler.com/install.sh | sh

# Initialize package.json and install latest MCP SDK
RUN npm init -y && \
    npm install @modelcontextprotocol/sdk@latest express@latest cors@latest

# Copy MCP integration source
COPY ../../mcp-integration/ ./
COPY src/ ./

# Install dependencies (will use latest versions)
RUN npm install

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start with environment loading
CMD ["sh", "-c", "eval \"$(doppler secrets download --no-file --format=export --project=ten-chat-pipedream-mcp --config=mcp-server-prd)\" && node server.js"]