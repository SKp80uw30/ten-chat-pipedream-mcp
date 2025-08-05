FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create basic Jitsi placeholder service
COPY src/nginx.conf /etc/nginx/nginx.conf
COPY src/index.html /usr/share/nginx/html/index.html

# Expose HTTP port (Railway will handle HTTPS)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]