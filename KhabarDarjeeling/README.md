# खबर दार्जिलिंग — React Native App

A full-featured mobile app (Android + iOS) for Khabar Darjeeling that **automatically syncs with your live website** — any article published on khabardarjeeling.space instantly appears in the app.

---

## 🏗️ Architecture

```
khabardarjeeling.space (Cloudflare Pages)
         │
         ▼
  Appwrite Backend (nyc.cloud.appwrite.io)
  ├── Khabar_db / articles collection
  ├── Khabar_db / user_profiles collection
  └── article-image storage bucket
         │
         ▼
  React Native App (Android + iOS)
  ├── Live polling every 60s for new articles
  ├── Breaking news ticker (live)
  ├── Full article reader + YouTube video
  ├── User auth (login / register)
  └── Profile editing + avatar upload
```

---

## 📁 Project Structure

```
KhabarDarjeeling/
├── App.js                          # Entry point
├── package.json
└── src/
    ├── screens/
    │   ├── HomeScreen.js           # News feed, categories, live refresh
    │   ├── ArticleScreen.js        # Article reader + YouTube video embed
    │   ├── SearchScreen.js         # Full-text search
    │   ├── ProfileScreen.js        # User profile, avatar upload
    │   └── AuthScreen.js           # Login / Register
    ├── components/
    │   └── NewsCard.js             # Reusable card (featured/default/compact)
    ├── services/
    │   ├── appwrite.js             # All Appwrite API calls
    │   └── notifications.js        # Push notification setup
    ├── context/
    │   └── AuthContext.js          # Global auth state
    ├── navigation/
    │   └── AppNavigator.js         # Bottom tabs + Stack navigator
    └── utils/
        └── theme.js                # Colors, fonts, sizes
```

---

## ⚡ How Live Sync Works

| Feature | How it works |
|---|---|
| **New articles appear** | App polls Appwrite every **60 seconds** automatically |
| **"N new articles" toast** | Detects new articles without full reload |
| **Pull-to-refresh** | Manual refresh anytime |
| **Breaking news ticker** | Fetches breaking category on mount |
| **Videos** | YouTube ID stored in article → embedded with WebView |
| **Images** | Loaded directly from Appwrite storage bucket |

---

## 🚀 Setup

### 1. Prerequisites
```bash
node >= 18
React Native CLI (not Expo)
Android Studio (for Android)
Xcode 14+ (for iOS, macOS only)
```

### 2. Install dependencies
```bash
cd KhabarDarjeeling
npm install

# iOS only
cd ios && pod install && cd ..
```

### 3. Android — Vector Icons setup
In `android/app/build.gradle`, add:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### 4. iOS — Permissions (ios/KhabarDarjeeling/Info.plist)
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Used to upload your profile photo</string>
<key>NSCameraUsageDescription</key>
<string>Used to take a profile photo</string>
```

### 5. Android Permissions (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.VIBRATE" />
```

### 6. Run
```bash
# Android
npm run android

# iOS
npm run ios
```

---

## 🔔 Push Notifications (Optional)
For server-side push notifications when new articles are published, set up a webhook in Appwrite:
- **Trigger:** On document create in `articles` collection
- **Send to:** Your FCM / APNs server
- **Payload:** Article title, ID, category

---

## 🎨 Branding
| Token | Value |
|---|---|
| Primary color | `#c41e3a` |
| Background | `#0f0f0f` |
| Surface | `#1a1a1a` |
| Breaking badge | `#ff3b3b` |
| Video badge | `#6c5ce7` |

---

## 📡 Appwrite Config (already set in appwrite.js)
| Key | Value |
|---|---|
| Endpoint | `https://nyc.cloud.appwrite.io/v1` |
| Project ID | `khabardarjeeling` |
| Database | `Khabar_db` |
| Articles collection | `articles` |
| Profiles collection | `user_profiles` |
| Storage bucket | `article-image` |

---

## 📱 Screens

### Home
- Breaking news live ticker at top
- Featured article hero card
- Category filter tabs (All, Breaking, Darjeeling, Kalimpong, etc.)
- Infinite scroll feed
- Auto-detects new articles with toast notification
- Pull-to-refresh

### Article
- Full article reader
- YouTube video embed (auto-plays)
- Article image from Appwrite storage
- Native Share sheet
- Breaking / Video badges

### Search
- Debounced live search via Appwrite full-text search
- Results as compact cards

### Profile
- View/edit display name and bio
- Avatar upload to Appwrite storage
- Email verification status
- Sign out
