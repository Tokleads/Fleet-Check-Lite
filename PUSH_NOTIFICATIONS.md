# Titan Fleet - Push Notification System

## Overview

Titan Fleet now includes a **complete push notification system** powered by Firebase Cloud Messaging (FCM). This system enables managers to send real-time notifications to drivers, even when the app is closed, providing critical communication for time-sensitive situations like limited work availability, urgent vehicle checks, or emergency alerts.

---

## Features

### Core Capabilities

**For Managers:**
- **Broadcast notifications** to all drivers or specific groups
- **Quick templates** for common messages (limited work, urgent checks, etc.)
- **Priority levels** (normal, high) for message urgency
- **Click actions** (open app, call office, navigate to page)
- **Targeted delivery** (all users, drivers only, managers only)
- **Notification history** and delivery tracking

**For Drivers:**
- **Push notifications** even when app is closed
- **Notification center** to view all messages
- **Mark as read/unread** functionality
- **Delete notifications** to manage inbox
- **Notification preferences** (enable/disable push)
- **Unread badge** in navigation
- **Click-to-call** for urgent messages

**Technical Features:**
- **Offline support** - Notifications queued if device offline
- **Multi-device support** - Receive on all logged-in devices
- **Background sync** - Automatic retry for failed deliveries
- **Token management** - Automatic cleanup of invalid tokens
- **Database persistence** - All notifications stored for history
- **Security** - Company-scoped, role-based access

---

## Architecture

### System Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Frontend Service** | Client-side notification handling | Firebase SDK |
| **Backend Service** | Server-side notification sending | Firebase Admin SDK |
| **Service Worker** | Background notification handling | Web Push API |
| **Database** | Token and notification storage | PostgreSQL |
| **API Routes** | REST endpoints for notifications | Express.js |

### Data Flow

```
Manager Broadcast
    ↓
Backend API (/api/notifications/broadcast)
    ↓
Firebase Cloud Messaging
    ↓
Service Worker (background)
    ↓
Push Notification (device)
    ↓
User clicks notification
    ↓
App opens to specific page
```

---

## File Structure

```
client/
├── src/
│   ├── services/
│   │   └── pushNotifications.ts          # Client-side FCM service
│   ├── hooks/
│   │   └── use-push-notifications.tsx    # React hooks
│   ├── components/
│   │   └── NotificationBadge.tsx         # Unread count badge
│   ├── pages/
│   │   ├── manager/
│   │   │   └── BroadcastNotification.tsx # Manager broadcast UI
│   │   └── driver/
│   │       └── NotificationCenter.tsx    # Driver notification center
│   └── public/
│       └── sw.js                         # Service worker (push handlers)

server/
├── pushNotificationService.ts            # Backend FCM service
├── notificationRoutes.ts                 # API routes
└── routes.ts                             # Route registration

shared/
└── schema.ts                             # Database schema
    ├── notificationTokens                # FCM tokens
    └── notifications                     # Notification history
```

---

## Setup Guide

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `titan-fleet`
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Cloud Messaging** tab
3. Note down:
   - **Server Key** (for backend)
   - **Sender ID** (for frontend)

### Step 3: Generate Web Push Certificate

1. In Cloud Messaging tab, scroll to **Web Push certificates**
2. Click **Generate key pair**
3. Copy the **VAPID key** (starts with `B...`)

### Step 4: Get Firebase Config

1. In Project Settings, scroll to **Your apps**
2. Click **Web** icon (</>) to add web app
3. Enter app nickname: `Titan Fleet Web`
4. Copy the `firebaseConfig` object

### Step 5: Configure Environment Variables

Create `.env` file in project root:

```bash
# Firebase Configuration (Frontend)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=titan-fleet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=titan-fleet
VITE_FIREBASE_STORAGE_BUCKET=titan-fleet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BNxyz...

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=titan-fleet
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"titan-fleet",...}'
```

### Step 6: Generate Service Account Key

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download JSON file
4. Copy entire JSON content to `FIREBASE_SERVICE_ACCOUNT` env variable

### Step 7: Run Database Migration

```bash
cd /home/ubuntu/titan-fleet
npm run db:push
```

This creates the `notification_tokens` and `notifications` tables.

### Step 8: Register API Routes

Add to `server/routes.ts`:

```typescript
import notificationRoutes from './notificationRoutes';

// Register notification routes
app.use('/api/notifications', notificationRoutes);
```

### Step 9: Test Notifications

1. Start the development server
2. Open app in browser
3. Go to Driver Dashboard
4. Click notification bell icon
5. Enable notifications (allow permission)
6. Go to Manager Broadcast page
7. Send test notification
8. Check if notification appears

---

## Usage Examples

### Manager: Send Broadcast Notification

```typescript
// Navigate to /manager/broadcast
// Fill in form:
// - Title: "⚠️ Limited Work Available"
// - Message: "Call office NOW to guarantee your work slot"
// - Send To: Drivers Only
// - Priority: High
// - Click Action: Call Office
// Click "Send Notification"
```

### Driver: Enable Notifications

```typescript
// Navigate to /driver/notifications
// Click "Settings"
// Toggle "Push Notifications" ON
// Allow permission in browser
```

### Programmatic: Send Custom Notification

```typescript
// Backend (server-side)
import { pushNotificationService } from './pushNotificationService';

await pushNotificationService.sendToUser(driverId, {
  title: 'Vehicle Inspection Due',
  body: 'Your vehicle inspection is due today',
  clickAction: '/driver/inspection/123',
  priority: 'high'
});
```

### React Hook: Subscribe to Notifications

```typescript
import { usePushNotifications } from '@/hooks/use-push-notifications';

function DriverApp() {
  const { isSubscribed, subscribe, unsubscribe } = usePushNotifications({
    userId: currentUser.id,
    userRole: 'driver',
    autoSubscribe: true
  });

  return (
    <div>
      {isSubscribed ? 'Notifications enabled' : 'Notifications disabled'}
      <button onClick={subscribe}>Enable</button>
      <button onClick={unsubscribe}>Disable</button>
    </div>
  );
}
```

---

## API Reference

### POST /api/notifications/subscribe

Subscribe user to push notifications.

**Request:**
```json
{
  "token": "fcm_token_here",
  "userId": 123,
  "userRole": "driver",
  "platform": "android",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscribed to push notifications"
}
```

### POST /api/notifications/broadcast

Broadcast notification to multiple users.

**Request:**
```json
{
  "companyId": 1,
  "title": "Limited Work Available",
  "body": "Call office NOW to guarantee your slot",
  "targetRole": "driver",
  "priority": "high",
  "clickAction": "tel:+441234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to 15 users",
  "sentCount": 15
}
```

### GET /api/notifications/history/:userId

Get user's notification history.

**Response:**
```json
[
  {
    "id": 1,
    "userId": 123,
    "title": "Limited Work Available",
    "body": "Call office NOW...",
    "isRead": false,
    "createdAt": "2025-01-29T10:00:00Z"
  }
]
```

### POST /api/notifications/:id/read

Mark notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Quick Templates

Pre-built templates for common scenarios:

### 1. Limited Work Available
```
Title: ⚠️ Limited Work Available
Body: Call office NOW to guarantee your work slot for today
Click Action: tel:+441234567890
Priority: High
```

### 2. Urgent Vehicle Check
```
Title: 🚨 Urgent: Vehicle Check Required
Body: Please complete vehicle inspection before starting shift
Click Action: /driver
Priority: High
```

### 3. Shift Reminder
```
Title: ⏰ Shift Starting Soon
Body: Your shift starts in 30 minutes. Please prepare to clock in.
Click Action: /driver
Priority: Normal
```

### 4. Weather Alert
```
Title: 🌧️ Weather Alert
Body: Heavy rain expected. Drive carefully and allow extra time.
Click Action: /driver
Priority: Normal
```

### 5. Office Closed
```
Title: 🏢 Office Closed
Body: Office will be closed tomorrow for maintenance. Contact emergency line if needed.
Click Action: /
Priority: Normal
```

---

## Browser Support

| Platform | Browser | Support | Notes |
|----------|---------|---------|-------|
| **Android** | Chrome 67+ | ✅ Full | Background notifications work |
| **Android** | Firefox 44+ | ✅ Full | Background notifications work |
| **Android** | Samsung Internet 8.2+ | ✅ Full | Background notifications work |
| **iOS** | Safari 16.4+ | ✅ Full | iOS 16.4+ required |
| **iOS** | Safari <16.4 | ❌ None | No push notification support |
| **Desktop** | Chrome 67+ | ✅ Full | All features work |
| **Desktop** | Firefox 44+ | ✅ Full | All features work |
| **Desktop** | Edge 79+ | ✅ Full | All features work |
| **Desktop** | Safari 16+ | ✅ Full | macOS Ventura+ required |

---

## Cost Analysis

### Firebase Cloud Messaging Pricing

**Free Tier:**
- **10 million messages/month** - FREE
- Unlimited devices
- Unlimited projects

**Typical Usage (50 drivers):**
- 50 drivers × 5 notifications/day = 250 messages/day
- 250 × 30 days = **7,500 messages/month**
- **Cost: $0/month** (well within free tier)

**Large Fleet (500 drivers):**
- 500 drivers × 5 notifications/day = 2,500 messages/day
- 2,500 × 30 days = **75,000 messages/month**
- **Cost: $0/month** (still within free tier)

**Enterprise (5,000 drivers):**
- 5,000 drivers × 5 notifications/day = 25,000 messages/day
- 25,000 × 30 days = **750,000 messages/month**
- **Cost: $0/month** (still within free tier!)

**Conclusion:** Firebase Cloud Messaging is **completely free** for fleet management use cases. You'd need to send 10+ million messages per month to exceed the free tier.

---

## Security Considerations

### Token Security

**Best Practices:**
- FCM tokens are stored in database with user association
- Tokens are automatically invalidated when device uninstalls app
- Invalid tokens are marked inactive and not used for sending
- Tokens are company-scoped to prevent cross-company leaks

### Data Privacy

**What's Stored:**
- FCM token (encrypted by Firebase)
- User ID and company ID
- Platform and user agent (for debugging)
- Notification history (title, body, timestamps)

**What's NOT Stored:**
- Device identifiers
- Personal information
- Location data
- Sensitive content

### Access Control

**Authorization:**
- Only managers can broadcast notifications
- Users can only view their own notifications
- Company-scoped data isolation
- Role-based access control (RBAC)

---

## Troubleshooting

### Notifications Not Appearing

**Possible Causes:**
1. Permission not granted
2. Service worker not registered
3. FCM token not saved
4. Invalid Firebase configuration
5. Browser doesn't support notifications

**Solutions:**
1. Check browser console for errors
2. Verify service worker is active: DevTools → Application → Service Workers
3. Check FCM token in database: `SELECT * FROM notification_tokens WHERE user_id = X`
4. Verify environment variables are set correctly
5. Test in supported browser (Chrome, Firefox, Safari 16.4+)

### Permission Denied

**Causes:**
- User clicked "Block" on permission prompt
- Browser settings block notifications
- iOS <16.4 (not supported)

**Solutions:**
1. Clear site data and try again
2. Check browser settings: Settings → Privacy → Notifications
3. iOS users: Update to iOS 16.4 or later
4. Desktop users: Check system notification settings

### Notifications Not Sending

**Causes:**
- Firebase Admin not initialized
- Invalid service account credentials
- FCM token expired or invalid
- Network connectivity issues

**Solutions:**
1. Check server logs for Firebase errors
2. Verify `FIREBASE_SERVICE_ACCOUNT` env variable
3. Test with Firebase Console → Cloud Messaging → Send test message
4. Check FCM token is active: `SELECT * FROM notification_tokens WHERE is_active = true`

### Service Worker Not Registering

**Causes:**
- Not served over HTTPS
- Service worker file not in correct location
- Browser doesn't support service workers

**Solutions:**
1. Ensure site is served over HTTPS (required for service workers)
2. Verify `sw.js` is at `/sw.js` (not `/client/sw.js`)
3. Check browser console for registration errors
4. Test in supported browser

---

## Performance Optimization

### Reduce Notification Fatigue

**Best Practices:**
- Don't send more than 3-5 notifications per day per user
- Use high priority only for truly urgent messages
- Group related notifications together
- Allow users to customize notification preferences
- Respect "Do Not Disturb" hours

### Optimize Delivery

**Strategies:**
- Batch notifications when possible
- Use appropriate priority levels (high = immediate, normal = best effort)
- Clean up inactive tokens regularly
- Monitor delivery rates and adjust
- Use notification tags to replace outdated messages

### Database Performance

**Optimizations:**
- Index on `user_id` and `is_read` for fast queries
- Archive old notifications (>90 days)
- Limit notification history to 100 per user
- Use pagination for notification list
- Cache unread count

---

## Future Enhancements

### Phase 2 (Optional)

1. **Rich Notifications**
   - Inline reply
   - Action buttons (Accept/Decline)
   - Progress indicators
   - Custom sounds

2. **Advanced Targeting**
   - Geofence-based notifications
   - Vehicle-specific alerts
   - Time-based scheduling
   - A/B testing

3. **Analytics**
   - Delivery rates
   - Open rates
   - Click-through rates
   - Engagement metrics

4. **Integration**
   - SMS fallback for critical messages
   - Email notifications
   - Slack/Teams integration
   - Webhook support

---

## Testing Checklist

### Before Deployment

- [ ] Firebase project created and configured
- [ ] Environment variables set correctly
- [ ] Database migration completed
- [ ] Service worker registered successfully
- [ ] Test notification sent and received
- [ ] Permission prompt works on all browsers
- [ ] Notification center displays messages
- [ ] Broadcast UI sends to multiple users
- [ ] Click actions work (open app, call, navigate)
- [ ] Unread badge updates correctly
- [ ] Mark as read/unread works
- [ ] Delete notification works
- [ ] Enable/disable notifications works
- [ ] Tested on Android Chrome
- [ ] Tested on iOS Safari 16.4+
- [ ] Tested on desktop browsers

---

## Support

### Common Issues

**Q: Notifications not working on iOS**  
A: iOS requires Safari 16.4+ (iOS 16.4+). Older versions don't support push notifications.

**Q: How do I test notifications locally?**  
A: Use `localhost` or deploy to HTTPS. Service workers require secure context.

**Q: Can I customize notification sound?**  
A: Yes, but requires native app. PWA uses system default sound.

**Q: How long are notifications stored?**  
A: Indefinitely in database. Consider archiving after 90 days.

**Q: Can I send notifications to specific drivers?**  
A: Yes, use `targetUserIds` parameter in broadcast API.

---

## Resources

### Documentation
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Notifications](https://web.dev/push-notifications/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Tools
- [Firebase Console](https://console.firebase.google.com/)
- [FCM Testing Tool](https://firebase.google.com/docs/cloud-messaging/js/send-multiple)
- [Push Notification Tester](https://web-push-codelab.glitch.me/)

---

**Last Updated:** January 29, 2025  
**Version:** 1.0  
**Author:** Manus AI
