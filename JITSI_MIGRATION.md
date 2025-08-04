# Jitsi Meet Migration Guide

## Overview
This project has been configured to use **Jitsi Meet** instead of Agora for WebRTC functionality, providing a free, open-source alternative for voice and video communication.

## Why Jitsi Meet?

### Benefits over Agora:
- ✅ **Free & Open Source** - No API keys or subscription fees
- ✅ **Self-hostable** - Full control over your infrastructure  
- ✅ **Privacy-focused** - No third-party data collection
- ✅ **WebRTC-based** - Same underlying technology as Agora
- ✅ **JavaScript SDK** - Easy integration with existing React/Next.js apps

## Configuration Changes

### Environment Variables
**Removed:**
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

**Added:**
- `JITSI_DOMAIN` (default: "meet.jit.si")
- `JITSI_ROOM_PREFIX` (default: "ten-agent")

### Configuration Files Updated:
- `ten-agent-config.json` - Updated RTC provider to Jitsi
- `start.sh` - Removed Agora validation, added Jitsi config
- `doppler_env_variables.md` - Updated environment variables

## Integration Components

### 1. JitsiMeetComponent.jsx
React component for embedding Jitsi Meet in the TEN Agent playground:

```jsx
import JitsiMeetComponent from '../jitsi-integration/JitsiMeetComponent';

<JitsiMeetComponent
  domain="meet.jit.si"
  roomName="ten-agent-room-123"
  width="100%"
  height="400px"
  onApiReady={(api) => console.log('Jitsi ready')}
/>
```

### 2. jitsi-service.js
Service class for programmatic control:

```javascript
import JitsiMeetService from '../jitsi-integration/jitsi-service';

const jitsiService = new JitsiMeetService('meet.jit.si');
await jitsiService.initialize('my-room', containerElement);
jitsiService.toggleAudio();
jitsiService.sendChatMessage('Hello from TEN Agent!');
```

## Deployment Options

### Option 1: Use Public Jitsi (meet.jit.si)
- **Pros:** No setup required, immediate functionality
- **Cons:** Less control, external dependency
- **Best for:** Development, testing, MVP

### Option 2: Self-hosted Jitsi Meet
- **Pros:** Full control, customization, privacy
- **Cons:** Requires server setup and maintenance  
- **Best for:** Production, enterprise use

## Self-hosting Jitsi Meet

### Quick Docker Setup:
```bash
# Clone Jitsi Docker setup
git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet

# Generate secrets
cp env.example .env
./gen-passwords.sh

# Start services
docker-compose up -d
```

### Environment Variables for Self-hosted:
```bash
# Update in Doppler
doppler secrets set JITSI_DOMAIN="your-jitsi.domain.com"
```

## Integration with TEN Framework

### WebRTC Manager Replacement
The TEN Framework's RTC manager needs to be updated to use Jitsi instead of Agora:

1. **Replace Agora SDK imports** with Jitsi external API
2. **Update audio/video controls** to use Jitsi commands  
3. **Modify event handlers** for Jitsi events
4. **Update room management** with Jitsi room concepts

### Audio Processing Pipeline
Jitsi Meet provides:
- **Audio input/output** through WebRTC
- **Echo cancellation** built-in
- **Noise suppression** available
- **Audio levels** for voice detection

## API Comparison

### Agora vs Jitsi Commands:

| Function | Agora | Jitsi |
|----------|--------|--------|
| Join Room | `client.join()` | `new JitsiMeetExternalAPI()` |
| Mute Audio | `localAudioTrack.setMuted()` | `api.executeCommand('toggleAudio')` |
| Toggle Video | `localVideoTrack.setMuted()` | `api.executeCommand('toggleVideo')` |
| Leave Room | `client.leave()` | `api.executeCommand('hangup')` |
| Get Participants | `client.remoteUsers` | `api.getParticipants()` |

## Mobile Considerations

### PWA Compatibility:
Jitsi Meet works well with PWAs and supports:
- ✅ **Mobile browsers** (Chrome, Safari, Firefox)
- ✅ **iOS Safari** with proper HTTPS
- ✅ **Android Chrome** with microphone permissions
- ✅ **Offline capabilities** (with service worker)

### HTTPS Requirement:
- **Critical:** Jitsi requires HTTPS for microphone/camera access
- **Railway deployment** automatically provides HTTPS
- **Local development** may need ngrok or similar for testing

## Testing Checklist

- [ ] Jitsi Meet loads in browser
- [ ] Audio input/output works
- [ ] Video toggle functions  
- [ ] Chat messaging works
- [ ] Multiple participants can join
- [ ] Mobile browser compatibility
- [ ] PWA installation works
- [ ] HTTPS certificates valid

## Troubleshooting

### Common Issues:

1. **"Microphone not accessible"**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Test with Railway deployment URL

2. **"Failed to load Jitsi script"**
   - Verify JITSI_DOMAIN is accessible
   - Check CSP headers if using custom domain
   - Test with default meet.jit.si first

3. **"Room connection failed"**
   - Check network connectivity
   - Verify room name format
   - Test with simple room names first

## Migration Steps

1. **Remove Agora dependencies** from package.json
2. **Update RTC provider** in TEN Agent config
3. **Replace WebRTC components** with Jitsi integration  
4. **Test audio/video pipeline** with new setup
5. **Deploy and validate** on Railway platform

## Next Steps

1. **Custom Jitsi styling** to match TEN Agent UI
2. **Self-hosted deployment** for production use
3. **Advanced features** like recording, streaming
4. **Integration with MCP tools** for enhanced functionality