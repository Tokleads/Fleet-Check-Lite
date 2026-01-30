# Titan Fleet - Progressive Web App (PWA) Implementation

## Overview

Titan Fleet has been converted to a **Progressive Web App (PWA)**, providing an app-like experience with offline support, installability, and enhanced performance.

---

## Features Implemented

### ✅ Installability
- **Add to Home Screen** on iOS and Android
- **Desktop installation** on Chrome, Edge, Safari
- **App icon** appears on device home screen
- **Splash screen** on app launch
- **Standalone mode** (no browser UI)

### ✅ Offline Support
- **Service Worker** caches core assets
- **Offline fallback page** when no connection
- **GPS queue** persists offline location updates
- **Inspection data** saved locally until sync
- **Smart caching** strategy for optimal performance

### ✅ Performance
- **Fast loading** with precached assets
- **Runtime caching** for API responses
- **Background sync** for offline data
- **Optimized network usage**

### ✅ User Experience
- **Install prompt** after 30 seconds (non-intrusive)
- **iOS-specific instructions** for Safari users
- **Update notifications** when new version available
- **Persistent storage** request for data protection

---

## File Structure

```
client/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── offline.html           # Offline fallback page
│   └── icons/                 # App icons (all sizes)
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
├── src/
│   ├── components/
│   │   └── PWAInstallPrompt.tsx   # Install prompt UI
│   └── lib/
│       └── registerSW.ts          # Service worker registration
└── index.html                     # PWA meta tags
```

---

## How It Works

### 1. Service Worker Registration

The service worker is registered in `main.tsx` (production only):

```typescript
if (import.meta.env.PROD) {
  registerServiceWorker();
  requestPersistentStorage();
}
```

### 2. Caching Strategy

**Precache (on install):**
- `/` - Home page
- `/index.html` - Main HTML
- `/offline.html` - Offline fallback
- `/manifest.json` - PWA manifest
- App icons

**Runtime Cache:**
- **API requests:** Network first, cache fallback
- **Static assets:** Cache first, network fallback
- **Navigation:** Cache with offline fallback

### 3. Install Prompt

The install prompt appears after 30 seconds:
- **Android/Desktop:** Native install dialog
- **iOS:** Instructions for "Add to Home Screen"
- **Dismissible:** Won't show again for 7 days

### 4. Offline Mode

When offline:
- Shows custom offline page
- GPS updates queued in localStorage
- Inspection data saved locally
- Auto-sync when connection restored

---

## Installation Instructions

### For Users

#### **Android**
1. Open Titan Fleet in Chrome
2. Tap the "Install" button in the prompt
3. Or tap menu (⋮) → "Install app"
4. App icon appears on home screen

#### **iOS (Safari)**
1. Open Titan Fleet in Safari
2. Tap the Share button (⎘)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. App icon appears on home screen

#### **Desktop (Chrome/Edge)**
1. Open Titan Fleet in browser
2. Click the install icon (⊕) in address bar
3. Click "Install" in the dialog
4. App opens in standalone window

---

## Testing PWA Features

### 1. Test Installation

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Manifest" to verify manifest
4. Click "Service Workers" to check registration
5. Use "Add to home screen" in Application menu

### 2. Test Offline Mode

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Network" tab
3. Check "Offline" checkbox
4. Refresh page - should show offline.html
5. Navigate to any page - should work from cache

### 3. Test Service Worker

**Chrome DevTools:**
1. Go to Application → Service Workers
2. Check "Update on reload" for development
3. Click "Unregister" to remove SW
4. Refresh to re-register

### 4. Test Caching

**Chrome DevTools:**
1. Go to Application → Cache Storage
2. Expand "titan-fleet-v1" to see precached files
3. Expand "titan-fleet-runtime-v1" to see runtime cache
4. Right-click to delete cache for testing

---

## Configuration

### PWA Manifest (`manifest.json`)

```json
{
  "name": "Titan Fleet Management",
  "short_name": "Titan Fleet",
  "theme_color": "#00a3ff",
  "background_color": "#0f172a",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [...],
  "shortcuts": [...]
}
```

**Key settings:**
- `display: "standalone"` - Hides browser UI
- `theme_color` - Matches app branding
- `shortcuts` - Quick actions from home screen

### Service Worker (`sw.js`)

**Cache names:**
- `titan-fleet-v1` - Precache
- `titan-fleet-runtime-v1` - Runtime cache

**Update cache version** when deploying changes:
```javascript
const CACHE_NAME = 'titan-fleet-v2'; // Increment version
```

---

## Deployment Checklist

### Before Deploying

- [ ] Update cache version in `sw.js`
- [ ] Test install prompt on mobile
- [ ] Test offline mode
- [ ] Verify all icons load correctly
- [ ] Check manifest.json is accessible
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on desktop browsers

### After Deploying

- [ ] Verify service worker registers
- [ ] Check caching works correctly
- [ ] Test offline functionality
- [ ] Verify install prompt appears
- [ ] Check app icons on home screen
- [ ] Test background sync (GPS queue)

---

## Troubleshooting

### Service Worker Not Registering

**Causes:**
- Not served over HTTPS (required for SW)
- Service worker file not in root
- Browser doesn't support service workers

**Solutions:**
1. Check browser console for errors
2. Verify `sw.js` is at `/sw.js` (not `/client/sw.js`)
3. Ensure site is served over HTTPS
4. Check browser compatibility

### Install Prompt Not Showing

**Causes:**
- Already installed
- User dismissed recently
- PWA criteria not met
- iOS doesn't support beforeinstallprompt

**Solutions:**
1. Check if already installed (standalone mode)
2. Clear localStorage: `pwa-install-dismissed`
3. Verify manifest.json is valid
4. iOS users must manually add to home screen

### Offline Mode Not Working

**Causes:**
- Service worker not active
- Cache not populated
- Network request not intercepted

**Solutions:**
1. Check service worker status in DevTools
2. Verify cache contains files
3. Check fetch event handlers in SW
4. Test with Chrome DevTools offline mode

### Icons Not Displaying

**Causes:**
- Icon files not generated
- Wrong file paths in manifest
- Icons not cached by service worker

**Solutions:**
1. Run `./generate-icons.sh` to create icons
2. Verify icons exist in `/client/public/icons/`
3. Check manifest.json paths
4. Clear cache and re-register SW

---

## Performance Metrics

### Lighthouse PWA Score

**Target scores:**
- Progressive Web App: 100/100
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

**Run Lighthouse:**
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

### Key Metrics

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | <1.8s | TBD |
| Largest Contentful Paint | <2.5s | TBD |
| Time to Interactive | <3.8s | TBD |
| Cumulative Layout Shift | <0.1 | TBD |
| Total Blocking Time | <200ms | TBD |

---

## Browser Support

### Fully Supported
- ✅ Chrome 67+ (Android, Desktop)
- ✅ Edge 79+ (Desktop)
- ✅ Safari 11.1+ (iOS, macOS)
- ✅ Firefox 44+ (Android, Desktop)
- ✅ Samsung Internet 8.2+

### Partial Support
- ⚠️ iOS Safari - No beforeinstallprompt event
- ⚠️ Firefox iOS - Uses Safari engine
- ⚠️ Opera Mini - Limited SW support

### Not Supported
- ❌ Internet Explorer (all versions)
- ❌ Legacy browsers

---

## Future Enhancements

### Phase 2 (Optional)

1. **Push Notifications**
   - Defect alerts
   - Inspection reminders
   - Stagnation warnings

2. **Background Sync**
   - Automatic GPS sync when online
   - Inspection upload queue
   - Photo upload queue

3. **Advanced Caching**
   - Predictive prefetching
   - Smart cache invalidation
   - Offline-first architecture

4. **Native Features**
   - Share target API
   - Contact picker
   - File system access
   - Clipboard API

---

## Resources

### Documentation
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google: PWA Checklist](https://web.dev/pwa-checklist/)
- [Web.dev: Service Workers](https://web.dev/service-workers/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Manifest Generator](https://app-manifest.firebaseapp.com/)

### Testing
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [BrowserStack](https://www.browserstack.com/) - Cross-browser testing
- [LambdaTest](https://www.lambdatest.com/) - Mobile testing

---

## Support

For PWA-related issues:
1. Check browser console for errors
2. Review service worker status in DevTools
3. Verify manifest.json is valid
4. Test on multiple devices/browsers
5. Check this documentation for troubleshooting

---

**Last Updated:** January 29, 2025  
**PWA Version:** 1.0  
**Service Worker Version:** v1
