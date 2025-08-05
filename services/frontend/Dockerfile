FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl bash

# Create a simple frontend service for now
# We'll enhance this once basic deployment works
COPY package.json ./
RUN npm install

# Copy source files
COPY src/ ./src/

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start server
CMD ["node", "src/server.js"]