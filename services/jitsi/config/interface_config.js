/* eslint-disable no-unused-vars, no-var, max-len */
var interfaceConfig = {
    // Toolbar buttons configuration for TEN Framework integration
    TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'hangup', 'chat', 
        'raisehand', 'settings', 'tileview', 'videobackgroundblur'
    ],

    SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],

    // Hide Jitsi branding for clean TEN Framework integration  
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_BRAND_WATERMARK: false,
    BRAND_WATERMARK_LINK: '',

    // Hide promotional elements
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
    SHOW_CHROME_EXTENSION_BANNER: false,

    // Mobile optimizations
    MOBILE_APP_PROMO: false,
    NATIVE_APP_NAME: 'TEN Voice Agent',

    // Video layout optimizations  
    TILE_VIEW_MAX_COLUMNS: 5,
    VERTICAL_FILMSTRIP: true,

    // Audio/Video defaults for voice-first experience
    DISABLE_VIDEO_BACKGROUND: false,
    DISABLE_FOCUS_INDICATOR: false,
    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,

    // Close page configuration
    CLOSE_PAGE_GUEST_HINT: false,
    DISPLAY_WELCOME_PAGE_CONTENT: false,
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,

    // Invite and sharing
    DISABLE_INVITE_FUNCTIONS: true,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,

    // Optimize for TEN Framework voice AI use case
    HIDE_INVITE_MORE_HEADER: true,
    RECENT_LIST_ENABLED: false,

    // Connection indicators
    CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
    CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,

    // Video quality
    VIDEO_QUALITY_LABEL_DISABLED: false,

    // Notifications
    DISABLE_PRESENCE_STATUS: false,
    DISABLE_RINGING: false,

    // Language
    DEFAULT_LANGUAGE: 'en',

    // Misc
    DISABLE_PRINT_LOGS: false,
    HIDE_DEEP_LINKING_LOGO: true,
    LANG_DETECTION: true,
    SUPPORT_URL: '',

    // Live streaming
    LIVE_STREAMING_ENABLED: false,

    // Recording  
    RECORDING_ENABLED: false,

    // Transcription for TEN Framework integration
    TRANSCRIPTION_ENABLED: true,
};