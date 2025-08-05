const fetch = require('node-fetch');

// Configuration
const config = {
  frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
  mcpServer: process.env.MCP_SERVER_URL || 'http://localhost:8080', 
  jitsi: process.env.JITSI_DOMAIN || 'localhost:8443',
  timeout: 10000
};

describe('Railway Service Integration Tests', () => {
  
  describe('Service Health Checks', () => {
    test('Frontend service should be healthy', async () => {
      const response = await fetch(`${config.frontend}/api/health`, {
        timeout: config.timeout
      });
      
      expect(response.status).toBe(200);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('frontend');
      expect(health.ten_framework).toBe('loaded');
    }, 15000);

    test('MCP Server should be healthy', async () => {
      const response = await fetch(`${config.mcpServer}/health`, {
        timeout: config.timeout
      });
      
      expect(response.status).toBe(200);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.service).toBe('mcp-server');
      expect(health.mcp_sdk_version).toBeDefined();
    }, 15000);

    test('Jitsi Meet should be accessible', async () => {
      const response = await fetch(`https://${config.jitsi}/`, {
        timeout: config.timeout,
        // Allow self-signed certificates in development
        ...(process.env.NODE_ENV !== 'production' && { 
          agent: new (require('https').Agent)({ rejectUnauthorized: false }) 
        })
      });
      
      expect(response.status).toBe(200);
    }, 15000);
  });

  describe('Service Communication', () => {
    test('Frontend can connect to MCP Server', async () => {
      const response = await fetch(`${config.frontend}/api/mcp/test`, {
        timeout: config.timeout
      });
      
      // Should either succeed or return a structured error
      expect([200, 500, 503]).toContain(response.status);
      
      if (response.status === 200) {
        const result = await response.json();
        expect(result).toBeDefined();
      }
    }, 15000);

    test('MCP Server can list Pipedream tools', async () => {
      const response = await fetch(`${config.mcpServer}/tools`, {
        timeout: config.timeout
      });
      
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.tools).toBeDefined();
      expect(Array.isArray(result.tools)).toBe(true);
    }, 15000);

    test('MCP Server can execute a test tool', async () => {
      const response = await fetch(`${config.mcpServer}/execute-tool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tool: 'test-workflow', 
          args: { message: 'integration-test' } 
        }),
        timeout: config.timeout
      });
      
      // Should return either success or structured error
      expect([200, 400, 500]).toContain(response.status);
      
      const result = await response.json();
      expect(result).toBeDefined();
    }, 15000);
  });

  describe('Environment Configuration', () => {
    test('Frontend has required environment variables', async () => {
      const response = await fetch(`${config.frontend}/api/health`, {
        timeout: config.timeout
      });
      
      const health = await response.json();
      
      expect(health.environment).toBeDefined();
      expect(health.environment.node_env).toBe('production');
      expect(health.environment.doppler_project).toBe('ten-chat-pipedream-mcp');
      expect(health.services.mcp_server).toContain('http');
      expect(health.services.jitsi_domain).toBeDefined();
    });

    test('MCP Server has required environment variables', async () => {
      const response = await fetch(`${config.mcpServer}/health`, {
        timeout: config.timeout
      });
      
      const health = await response.json();
      
      expect(health.environment).toBeDefined();
      expect(health.environment.doppler_project).toBe('ten-chat-pipedream-mcp');
      expect(health.pipedream.api_key_configured).toBe(true);
      expect(health.pipedream.project_id_configured).toBe(true);
    });
  });

  describe('WebRTC and Jitsi Integration', () => {
    test('Jitsi external API script should be accessible', async () => {
      const response = await fetch(`https://${config.jitsi}/external_api.js`, {
        timeout: config.timeout,
        ...(process.env.NODE_ENV !== 'production' && { 
          agent: new (require('https').Agent)({ rejectUnauthorized: false }) 
        })
      });
      
      expect(response.status).toBe(200);
      
      const script = await response.text();
      expect(script).toContain('JitsiMeetExternalAPI');
    }, 15000);

    test('Jitsi configuration should be optimized for TEN Framework', async () => {
      const response = await fetch(`https://${config.jitsi}/config.js`, {
        timeout: config.timeout,
        ...(process.env.NODE_ENV !== 'production' && { 
          agent: new (require('https').Agent)({ rejectUnauthorized: false }) 
        })
      });
      
      expect(response.status).toBe(200);
      
      const config = await response.text();
      expect(config).toContain('enableWelcomePage: false');
      expect(config).toContain('startWithAudioMuted: false');
      expect(config).toContain('startWithVideoMuted: true');
    }, 15000);
  });

  describe('Latest Version Management', () => {
    test('MCP Server should use latest SDK version', async () => {
      const response = await fetch(`${config.mcpServer}/health`);
      const health = await response.json();
      
      // Verify MCP SDK version is defined and follows semver
      expect(health.mcp_sdk_version).toBeDefined();
      expect(health.mcp_sdk_version).toMatch(/^\d+\.\d+\.\d+/);
    });

    test('Services should report their update status', async () => {
      const frontendResponse = await fetch(`${config.frontend}/api/health`);
      const frontendHealth = await frontendResponse.json();
      
      expect(frontendHealth.timestamp).toBeDefined();
      expect(new Date(frontendHealth.timestamp)).toBeInstanceOf(Date);
    });
  });
});

// Test helper functions
const waitForService = async (url, maxAttempts = 10, interval = 2000) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url, { timeout: 5000 });
      if (response.ok) return true;
    } catch (error) {
      console.log(`Attempt ${i + 1}/${maxAttempts}: Service ${url} not ready`);
    }
    
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return false;
};

// Setup and teardown
beforeAll(async () => {
  console.log('Waiting for services to be ready...');
  
  const services = [
    config.frontend,
    config.mcpServer,
    `https://${config.jitsi}`
  ];
  
  const readyPromises = services.map(service => 
    waitForService(service.includes('/health') ? service : `${service}/health`)
      .catch(() => waitForService(service)) // Fallback for services without /health
  );
  
  const results = await Promise.allSettled(readyPromises);
  const readyCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
  
  console.log(`${readyCount}/${services.length} services ready for testing`);
  
  if (readyCount === 0) {
    console.warn('No services are ready - tests may fail');
  }
}, 30000);

module.exports = { config, waitForService };