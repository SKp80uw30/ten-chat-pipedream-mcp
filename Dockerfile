FROM node:20-alpine AS builder

WORKDIR /app

# Copy TEN Agent playground files
COPY ten-framework/ai_agents/playground/ ./playground/
COPY package*.json ./

# Install dependencies for main project
RUN npm install

# Install dependencies for playground
WORKDIR /app/playground
RUN npm install

# Build the playground application
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    bash

# Install Doppler CLI for environment variable management
RUN curl -Ls https://cli.doppler.com/install.sh | sh

# Copy built application
COPY --from=builder /app ./

# Create environment script for Railway port configuration
COPY start.sh ./
RUN chmod +x start.sh

# Expose the port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start the application
CMD ["./start.sh"]