# Building Simple Badminton

## Quick Build

```bash
bash build.sh
```

## Prerequisites

- Node.js 20+
- JDK 17
- Android SDK with:
  - Platform API 36
  - Build Tools 36.0.0
  - NDK 27.1.12297006
- `ANDROID_HOME` environment variable pointing to the SDK

## Manual Build Steps

```bash
# Install JavaScript dependencies
npm ci

# Build per-ABI release APKs
cd android
./gradlew assembleRelease --no-daemon
```

Output APKs:
```
android/app/build/outputs/apk/release/
  app-arm64-v8a-release.apk
  app-armeabi-v7a-release.apk
  app-x86_64-release.apk
```

## Reproducible Builds — React Native Dev Server IP

React Native bakes the build host's LAN IP into the APK as the string resource
`react_native_dev_server_ip`. This makes builds non-reproducible across environments.

**Fix applied**: `android/gradle.properties` contains:

```properties
reactNativeDevServerIp=localhost
```

This pins the value to `localhost` in all builds, making the APK reproducible
regardless of the build machine's network configuration.

This is the official workaround documented in
[RN PR #55531](https://github.com/facebook/react-native/pull/55531), which will
be merged for a future React Native release. Once RN ships with that fix, this
property becomes a no-op and can be removed.

## Signing

If `keystore.properties` is absent (F-Droid build environment), the APKs are
produced **unsigned**. F-Droid signs them with their own key.
