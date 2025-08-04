import React, { useEffect, useRef, useState } from 'react';

const JitsiMeetComponent = ({ 
  domain = 'meet.jit.si',
  roomName = 'ten-agent-room',
  width = '100%',
  height = '400px',
  configOverwrite = {},
  interfaceConfigOverwrite = {},
  onApiReady = () => {},
  onAudioAvailabilityChanged = () => {},
  onAudioMuteStatusChanged = () => {},
  onVideoMuteStatusChanged = () => {}
}) => {
  const jitsiContainerRef = useRef(null);
  const [api, setApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://${domain}/external_api.js`;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();
        
        if (jitsiContainerRef.current) {
          const options = {
            roomName,
            width,
            height,
            parentNode: jitsiContainerRef.current,
            configOverwrite: {
              enableWelcomePage: false,
              enableClosePage: false,
              disableInviteFunctions: true,
              startWithAudioMuted: false,
              startWithVideoMuted: true,
              prejoinPageEnabled: false,
              ...configOverwrite
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
                'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'e2ee'
              ],
              SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              ...interfaceConfigOverwrite
            }
          };

          const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
          
          // Event listeners
          jitsiApi.addEventListener('apiReady', () => {
            console.log('Jitsi Meet API is ready');
            setApi(jitsiApi);
            setIsLoading(false);
            onApiReady(jitsiApi);
          });

          jitsiApi.addEventListener('audioAvailabilityChanged', onAudioAvailabilityChanged);
          jitsiApi.addEventListener('audioMuteStatusChanged', onAudioMuteStatusChanged);
          jitsiApi.addEventListener('videoMuteStatusChanged', onVideoMuteStatusChanged);

          jitsiApi.addEventListener('readyToClose', () => {
            console.log('Jitsi Meet is ready to close');
            jitsiApi.dispose();
          });

          setApi(jitsiApi);
        }
      } catch (error) {
        console.error('Failed to load Jitsi Meet:', error);
        setIsLoading(false);
      }
    };

    initializeJitsi();

    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [domain, roomName]);

  const toggleAudio = () => {
    if (api) {
      api.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (api) {
      api.executeCommand('toggleVideo');
    }
  };

  const hangUp = () => {
    if (api) {
      api.executeCommand('hangup');
    }
  };

  return (
    <div className="jitsi-meet-container">
      {isLoading && (
        <div className="jitsi-loading">
          <p>Loading Jitsi Meet...</p>
        </div>
      )}
      <div 
        ref={jitsiContainerRef}
        style={{ width, height }}
        className="jitsi-meet-frame"
      />
      <div className="jitsi-controls" style={{ marginTop: '10px' }}>
        <button onClick={toggleAudio} className="btn btn-primary">
          Toggle Audio
        </button>
        <button onClick={toggleVideo} className="btn btn-secondary">
          Toggle Video
        </button>
        <button onClick={hangUp} className="btn btn-danger">
          Hang Up
        </button>
      </div>
    </div>
  );
};

export default JitsiMeetComponent;