# Cinderella Team — Android Build Guide

## Overview

This is the complete Expo React Native source for the Cinderella Team mobile app.  
The app connects to the existing Express API server and uses JWT authentication.

---

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- An Expo account at https://expo.dev (free)
- Java 17+ and Android Studio (for local builds)

---

## Environment Setup

Copy the app to your machine and create a `.env` file inside `artifacts/cinderella-mobile/`:

```
EXPO_PUBLIC_DOMAIN=your-api-domain.com
```

Replace `your-api-domain.com` with your deployed API server domain.

---

## Testing on Device (Expo Go)

1. Install **Expo Go** from Google Play on your Android device.
2. Run in the project root:
   ```bash
   pnpm --filter @workspace/cinderella-mobile run dev
   ```
3. Scan the QR code from the terminal with your phone camera.

---

## Building APK / AAB with EAS (Recommended)

### 1. Login to EAS

```bash
eas login
```

### 2. Initialize EAS for this project

```bash
cd artifacts/cinderella-mobile
eas init
```

This creates an `eas.json` configuration file. Use this template:

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Build Debug APK (for testing)

```bash
eas build --platform android --profile preview
```

- This produces a `.apk` file you can install directly on any Android phone.
- Download the APK from the EAS dashboard link provided after the build.

### 4. Build Release AAB (for Google Play)

```bash
eas build --platform android --profile production
```

- This produces a `.aab` (Android App Bundle) for uploading to Google Play.

### 5. Build Release APK (universal install)

Add this profile to `eas.json`:

```json
"release-apk": {
  "android": { "buildType": "apk", "gradleCommand": ":app:bundleRelease" }
}
```

Then run:

```bash
eas build --platform android --profile release-apk
```

---

## Local Android Build (without EAS)

If you prefer building locally with Android Studio:

```bash
cd artifacts/cinderella-mobile

# Generate the native Android project
npx expo prebuild --platform android

# Build debug APK
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Build release APK (requires signing setup)
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk

# Build release AAB
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Signing the Release APK/AAB

### Generate a keystore file

```bash
keytool -genkey -v -keystore cinderella-release.keystore \
  -alias cinderella -keyalg RSA -keysize 2048 -validity 10000
```

### Configure signing in `android/app/build.gradle`

```gradle
android {
  signingConfigs {
    release {
      storeFile file("cinderella-release.keystore")
      storePassword "YOUR_STORE_PASSWORD"
      keyAlias "cinderella"
      keyPassword "YOUR_KEY_PASSWORD"
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

### With EAS (easier — recommended)

Run `eas credentials` and follow the interactive prompts.  
EAS can generate and manage your keystore automatically.

---

## Google Play Submission

1. Build the AAB: `eas build --platform android --profile production`
2. Go to https://play.google.com/console
3. Create a new app → "Cinderella Team"
4. Upload the `.aab` file under **Production** or **Internal testing**
5. Fill in app details, screenshots, privacy policy
6. Submit for review

---

## Project Structure

```
artifacts/cinderella-mobile/
├── app/
│   ├── _layout.tsx          # Root layout: Cairo font, RTL, auth setup
│   ├── index.tsx            # Entry redirect
│   ├── login.tsx            # Login screen
│   ├── (tabs)/              # Main tab navigation
│   │   ├── _layout.tsx      # Tab bar (5 tabs) with auth guard
│   │   ├── index.tsx        # Dashboard (admin / marketer)
│   │   ├── orders.tsx       # Orders list with search & filter
│   │   ├── products.tsx     # Products catalog
│   │   ├── notifications.tsx # Notifications
│   │   └── more.tsx         # Profile, reports, marketers, logout
│   ├── order/
│   │   ├── [id].tsx         # Order detail + status change
│   │   └── new.tsx          # Create / edit order
│   ├── product/
│   │   ├── [id].tsx         # Product detail + edit (admin)
│   │   └── new.tsx          # Create product (admin)
│   ├── marketer/
│   │   ├── index.tsx        # Marketers list (admin)
│   │   ├── [id].tsx         # Marketer detail + edit
│   │   └── new.tsx          # Create marketer (admin)
│   └── reports.tsx          # Reports with charts
├── components/
│   ├── GoldButton.tsx       # Primary gold button
│   ├── InputField.tsx       # Arabic RTL input field
│   ├── StatCard.tsx         # Dashboard stat card
│   ├── OrderCard.tsx        # Order list item
│   ├── ProductCard.tsx      # Product list item
│   ├── StatusBadge.tsx      # Order status badge
│   ├── EmptyState.tsx       # Empty state component
│   └── SimpleBarChart.tsx   # Bar chart (no external libs)
├── context/
│   └── AuthContext.tsx      # JWT auth with AsyncStorage
├── constants/
│   └── colors.ts            # Brand colors (black + gold)
└── assets/
    └── images/
        ├── icon.png         # App icon (luxury crown)
        └── splash.png       # Splash screen
```

---

## Default Accounts (for testing)

| Role     | Username | Password    |
|----------|----------|-------------|
| Admin    | admin    | admin123    |
| Marketer | sara     | marketer123 |
| Marketer | fatima   | marketer123 |
| Marketer | noor     | marketer123 |

---

## Features

- ✅ JWT authentication with persistent session (AsyncStorage)
- ✅ Role-based UI (admin vs marketer views)
- ✅ Admin dashboard with stats, top marketers, top products
- ✅ Marketer dashboard with personal stats and balance
- ✅ Orders management (CRUD + 8 status pipeline)
- ✅ Automatic commission calculation on delivery
- ✅ Products catalog with admin management
- ✅ Marketer management (admin)
- ✅ Reports with period selector and charts
- ✅ In-app notifications
- ✅ Full Arabic RTL support
- ✅ Luxury black + gold dark theme
- ✅ Cairo Arabic font
- ✅ Pull-to-refresh on all lists
- ✅ Search and filter on orders

---

## Troubleshooting

**Metro bundler cache issues:**
```bash
npx expo start --clear
```

**Dependencies out of sync:**
```bash
pnpm install
```

**Type errors:**
```bash
pnpm --filter @workspace/cinderella-mobile run typecheck
```
