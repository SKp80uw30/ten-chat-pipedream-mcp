/* eslint-disable no-unused-vars, no-var */
var config = {
    // Connection and server configuration
    hosts: {
        domain: location.hostname,
        muc: 'conference.' + location.hostname,
        focus: 'focus.' + location.hostname,
    },

    // BOSH and WebSocket configuration  
    bosh: '//' + location.hostname + '/http-bind',
    websocket: 'wss://' + location.hostname + '/xmpp-websocket',

    // Client-side configuration for TEN Framework integration
    enableWelcomePage: false,
    enableClosePage: false,
    disableInviteFunctions: true,
    startWithAudioMuted: false,
    startWithVideoMuted: true,
    prejoinPageEnabled: false,

    // Audio/Video settings optimized for voice AI
    requireDisplayName: false,
    enableNoisyMicDetection: true,
    enableTalkWhileMuted: false,
    disableAudioLevels: false,

    // Recording and live streaming
    enableRecording: false,
    liveStreamingEnabled: false,
    hiddenDomain: 'recorder.' + location.hostname,

    // Analytics and monitoring
    enableAnalyticsLogging: false,
    deploymentInfo: {
        shard: 'ten-framework-shard',
        region: 'railway',
        userRegion: 'railway'
    },

    // Notifications
    enableCalendarIntegration: false,
    enableClosePage: false,
    notificationTimeouts: {
        short: 2500,
        medium: 5000,
        long: 10000
    },

    // Video configuration
    resolution: 720,
    constraints: {
        video: {
            height: {
                ideal: 720,
                max: 720,
                min: 240
            }
        }
    },

    // Audio configuration
    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,
    disableAP: false,
    disableAEC: false,
    disableNS: false,
    disableAGC: false,
    disableHPF: false,

    // P2P configuration
    p2p: {
        enabled: true,
        stunServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    },

    // Channel last N value - optimize for voice AI use case
    channelLastN: 4,

    // Video bridge configuration
    videobridge: {
        preferredCodec: 'VP9'
    },

    // Desktop sharing
    desktopSharingFrameRate: {
        min: 5,
        max: 15
    },

    // Mobile configuration
    disableDeepLinking: true,
    enableRemoteMute: true,
    enableLipSync: false,

    // Testing mode
    testing: {
        testMode: false,
        capScreenshareBitrate: 1,
        noAutoPlayVideo: false
    },

    // Transcription services for TEN Framework integration
    transcribingEnabled: true,
    transcribeWithAppLanguage: true,

    // Breakout rooms (disabled for voice AI use case)
    breakoutRooms: {
        hideAddRoomButton: true,
        hideAutoAssignButton: true,
        hideJoinRoomButton: false
    },

    // Whiteboard (disabled for voice AI use case)  
    whiteboard: {
        enabled: false,
        collabServerBaseUrl: ''
    },

    // External services
    giphy: {
        enabled: false
    }
};