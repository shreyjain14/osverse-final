# AR (Augmented Reality) Feature Documentation

## Overview

The Process Scheduling Visualizer now includes comprehensive AR (Augmented Reality) functionality that allows users to view Gantt charts in 3D space using their mobile devices. This feature provides an immersive way to interact with scheduling algorithms.

## Features

### 🎯 Core AR Features
- **3D Gantt Chart Visualization**: View process scheduling data as interactive 3D models
- **Mobile-Optimized AR**: Optimized for mobile devices with AR capabilities
- **QR Code Sharing**: Share AR experiences via QR codes
- **Cross-Platform Support**: Works on iOS and Android devices
- **Real-time Scene Stabilization**: Automatic scene anchoring and stabilization
- **Camera Permission Handling**: Proper camera access management

### 🔧 Technical Features
- **WebXR Support**: Native WebXR API integration
- **Model-viewer Integration**: Google's model-viewer for 3D rendering
- **Three.js GLB Generation**: Programmatic 3D model creation
- **Fallback Support**: Graceful degradation for unsupported devices
- **Performance Optimization**: Mobile-optimized rendering and interactions

## How to Use

### 1. Desktop Experience
1. Navigate to any scheduling algorithm page (e.g., FCFS, SJF, Round Robin)
2. Configure your processes and run the algorithm
3. Click the "View in AR" button in the Gantt Chart section
4. The AR modal will open with device compatibility information
5. Use the "Share for Mobile" button to generate a QR code

### 2. Mobile AR Experience
1. Scan the QR code with your mobile device
2. Allow camera permissions when prompted
3. Point your camera at a flat surface
4. Tap to place the 3D Gantt chart
5. Move around to view from different angles
6. Use touch gestures to interact with the model

### 3. Direct Mobile Access
1. Open the mobile AR viewer directly: `/ar-viewer?ar=true&gantt=[data]`
2. Follow the same steps as above for camera permissions and placement

## Device Requirements

### Minimum Requirements
- **Mobile Device**: iOS 12+ or Android 8+
- **Browser**: Safari (iOS) or Chrome (Android)
- **Camera**: Required for AR functionality
- **Internet**: Required for model-viewer loading
- **HTTPS**: Required for AR features (localhost works for development)

### Recommended Requirements
- **Device**: Modern smartphone with AR capabilities
- **Browser**: Latest version of Safari or Chrome
- **Lighting**: Well-lit environment for better tracking
- **Surface**: Flat, textured surface for optimal placement

## Technical Architecture

### Components

#### 1. SimpleARModal (`src/components/SimpleARModal.tsx`)
- Main AR modal component for desktop experience
- Handles device detection and capability checking
- Manages camera permissions and AR session initialization
- Provides QR code generation for mobile sharing

#### 2. AR Viewer Page (`src/app/ar-viewer/page.tsx`)
- Mobile-optimized AR experience
- Handles URL parameter parsing for Gantt data
- Provides direct mobile AR access
- Includes comprehensive error handling and user guidance

#### 3. AR Service (`src/lib/ar-service.ts`)
- Centralized AR functionality management
- Device capability detection
- Camera permission handling
- WebXR session management
- Error handling and user feedback

#### 4. Type Definitions
- `src/types/model-viewer.d.ts`: Model-viewer component types
- `src/types/webxr.d.ts`: WebXR API type definitions

### 3D Model Generation

The AR feature generates 3D models programmatically using Three.js:

```typescript
// GLB Generation Process
1. Create Three.js scene with proper lighting
2. Generate 3D bars for each Gantt entry
3. Add labels and visual elements
4. Export to GLB format using GLTFExporter
5. Create blob URL for model-viewer consumption
```

### AR Session Management

```typescript
// AR Session Flow
1. Check device capabilities (WebXR, camera, HTTPS)
2. Request camera permissions
3. Initialize model-viewer with AR configuration
4. Start AR session with proper event handling
5. Monitor tracking and stabilization status
6. Handle session end and cleanup
```

## Troubleshooting

### Common Issues

#### 1. Camera Permission Denied
**Problem**: AR modal shows "Camera Permission Required"
**Solution**: 
- Click "Allow Camera Access" button
- Check browser settings for camera permissions
- Ensure you're on HTTPS or localhost

#### 2. AR Not Available
**Problem**: Modal shows "AR Not Available"
**Solutions**:
- Use a mobile device with AR capabilities
- Ensure HTTPS connection
- Check if WebXR is supported in your browser
- Try the "Share for Mobile" option

#### 3. Scene Not Stabilizing
**Problem**: AR scene keeps moving or won't anchor
**Solutions**:
- Move to a well-lit area
- Point camera at a flat, textured surface
- Hold device steady for 2-3 seconds
- Try a different surface or location

#### 4. QR Code Not Working
**Problem**: Scanning QR code doesn't work
**Solutions**:
- Ensure you're using the computer's local IP address (not localhost)
- Use ngrok for public access: `ngrok http 3000`
- Check if mobile device can access the URL
- Try copying the link manually

#### 5. Model Not Loading
**Problem**: 3D model fails to load
**Solutions**:
- Check internet connection
- Refresh the page
- Try generating the model again
- Check browser console for errors

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "AR requires HTTPS connection" | AR features need secure connection | Use HTTPS or localhost |
| "Camera permission is required" | Camera access denied | Allow camera permissions |
| "AR is optimized for mobile devices" | Desktop AR limitations | Use mobile device or share via QR |
| "Failed to load AR viewer" | Model-viewer script failed | Check internet connection |
| "Failed to start AR session" | AR session initialization failed | Try again or use different device |

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern browser with WebXR support
- Mobile device for testing

### Installation
```bash
npm install
npm run dev
```

### Testing AR Features
1. **Desktop Testing**: Use browser dev tools to simulate mobile device
2. **Mobile Testing**: Use ngrok for public URL access
3. **QR Testing**: Generate QR codes and test scanning
4. **Camera Testing**: Test camera permissions on different devices

### ngrok Setup for Mobile Testing
```bash
# Install ngrok
npm install -g ngrok

# Start development server
npm run dev

# In another terminal, create public URL
ngrok http 3000

# Use the ngrok URL for mobile testing
```

## Performance Optimization

### Mobile Optimization
- **Lazy Loading**: Model-viewer loads only when needed
- **Compressed Models**: GLB files are optimized for size
- **Progressive Enhancement**: Graceful fallbacks for unsupported features
- **Memory Management**: Proper cleanup of 3D resources

### Browser Compatibility
- **Safari (iOS)**: Full AR support with Scene Viewer
- **Chrome (Android)**: Full AR support with WebXR
- **Other Browsers**: Fallback to basic 3D viewer

## Security Considerations

### Camera Access
- Camera permissions are requested explicitly
- Stream is stopped immediately after permission check
- No camera data is stored or transmitted

### HTTPS Requirement
- AR features require HTTPS for security
- Localhost is allowed for development
- Public deployment must use HTTPS

### Data Handling
- Gantt data is passed via URL parameters
- No sensitive data is stored
- Models are generated client-side

## Future Enhancements

### Planned Features
- **Hand Tracking**: Gesture-based interactions
- **Multi-User AR**: Collaborative AR experiences
- **Advanced Visualizations**: More complex 3D representations
- **Offline Support**: Cached models for offline viewing
- **AR Anchors**: Persistent AR placements

### Technical Improvements
- **WebGPU Integration**: Better 3D rendering performance
- **AR.js Integration**: Alternative AR framework support
- **Custom Shaders**: Enhanced visual effects
- **Spatial Audio**: Audio feedback for interactions

## Support

For issues or questions about the AR functionality:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Test on different devices and browsers
4. Ensure all requirements are met
5. Try the fallback options if available

## Contributing

To contribute to the AR functionality:

1. Follow the existing code structure
2. Test on multiple devices and browsers
3. Ensure proper error handling
4. Update documentation for new features
5. Maintain backward compatibility

---

**Note**: AR functionality requires modern devices and browsers. For the best experience, use a mobile device with AR capabilities and ensure proper lighting and surface conditions. 