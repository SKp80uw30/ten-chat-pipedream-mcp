/**
 * Jitsi Meet Service for TEN Agent Integration
 * Provides methods to interact with Jitsi Meet API
 */

class JitsiMeetService {
  constructor(domain = 'meet.jit.si') {
    this.domain = domain;
    this.api = null;
    this.roomName = null;
    this.isConnected = false;
  }

  /**
   * Initialize Jitsi Meet API
   * @param {string} roomName - The room name to join
   * @param {HTMLElement} container - DOM element to contain the meeting
   * @param {Object} config - Jitsi configuration options
   */
  async initialize(roomName, container, config = {}) {
    try {
      // Load Jitsi external API if not already loaded
      if (!window.JitsiMeetExternalAPI) {
        await this.loadJitsiScript();
      }

      const defaultConfig = {
        roomName,
        width: '100%',
        height: '100%',
        parentNode: container,
        configOverwrite: {
          enableWelcomePage: false,
          enableClosePage: false,
          disableInviteFunctions: true,
          startWithAudioMuted: false,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          enableNoisyMicDetection: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'hangup', 'chat', 
            'raisehand', 'settings', 'tileview'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false
        }
      };

      const options = { ...defaultConfig, ...config };
      this.api = new window.JitsiMeetExternalAPI(this.domain, options);
      this.roomName = roomName;

      // Set up event listeners
      this.setupEventListeners();

      return new Promise((resolve) => {
        this.api.addEventListener('apiReady', () => {
          this.isConnected = true;
          console.log('Jitsi Meet API ready for room:', roomName);
          resolve(this.api);
        });
      });

    } catch (error) {
      console.error('Failed to initialize Jitsi Meet:', error);
      throw error;
    }
  }

  /**
   * Load Jitsi external API script
   */
  loadJitsiScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://${this.domain}/external_api.js`;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Set up event listeners for Jitsi API
   */
  setupEventListeners() {
    if (!this.api) return;

    this.api.addEventListener('participantJoined', (participant) => {
      console.log('Participant joined:', participant);
    });

    this.api.addEventListener('participantLeft', (participant) => {
      console.log('Participant left:', participant);
    });

    this.api.addEventListener('audioAvailabilityChanged', (data) => {
      console.log('Audio availability changed:', data);
    });

    this.api.addEventListener('audioMuteStatusChanged', (data) => {
      console.log('Audio mute status changed:', data);
    });

    this.api.addEventListener('videoMuteStatusChanged', (data) => {
      console.log('Video mute status changed:', data);
    });

    this.api.addEventListener('readyToClose', () => {
      console.log('Jitsi Meet ready to close');
      this.cleanup();
    });
  }

  /**
   * Toggle audio mute/unmute
   */
  toggleAudio() {
    if (this.api) {
      this.api.executeCommand('toggleAudio');
    }
  }

  /**
   * Toggle video on/off
   */
  toggleVideo() {
    if (this.api) {
      this.api.executeCommand('toggleVideo');
    }
  }

  /**
   * Mute/unmute audio
   * @param {boolean} mute - true to mute, false to unmute
   */
  setAudioMuted(mute) {
    if (this.api) {
      if (mute) {
        this.api.executeCommand('muteEveryone');
      } else {
        this.api.executeCommand('unmuteEveryone');
      }
    }
  }

  /**
   * Start/stop video
   * @param {boolean} start - true to start video, false to stop
   */
  setVideoEnabled(start) {
    if (this.api) {
      if (start) {
        this.api.executeCommand('startVideo');
      } else {
        this.api.executeCommand('stopVideo');
      }
    }
  }

  /**
   * Send a chat message
   * @param {string} message - The message to send
   */
  sendChatMessage(message) {
    if (this.api) {
      this.api.executeCommand('sendChatMessage', message);
    }
  }

  /**
   * Get current participants
   */
  getParticipants() {
    if (this.api) {
      return this.api.getParticipants();
    }
    return [];
  }

  /**
   * Generate a unique room name
   * @param {string} prefix - Room name prefix
   */
  static generateRoomName(prefix = 'ten-agent') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Hang up and leave the meeting
   */
  hangUp() {
    if (this.api) {
      this.api.executeCommand('hangup');
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
    this.isConnected = false;
    this.roomName = null;
  }

  /**
   * Check if connected to a meeting
   */
  isConnectedToMeeting() {
    return this.isConnected && this.api !== null;
  }

  /**
   * Get current room name
   */
  getCurrentRoom() {
    return this.roomName;
  }
}

export default JitsiMeetService;