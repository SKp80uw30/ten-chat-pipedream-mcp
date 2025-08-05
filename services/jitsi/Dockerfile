FROM jitsi/web:latest

# Install Doppler CLI for environment management
RUN apt-get update && apt-get install -y curl && \
    curl -Ls https://cli.doppler.com/install.sh | bash && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy custom Jitsi configuration
COPY config/interface_config.js /defaults/interface_config.js
COPY config/config.js /defaults/config.js
COPY config/nginx.conf /defaults/nginx.conf

# Custom startup script that loads Doppler environment
COPY src/start-jitsi.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-jitsi.sh

# Expose standard Jitsi ports
EXPOSE 443 80 8080 8443 10000/udp

# Health check for Jitsi web interface
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f https://localhost/health || curl -f http://localhost/health || exit 1

# Use custom startup script
CMD ["/usr/local/bin/start-jitsi.sh"]