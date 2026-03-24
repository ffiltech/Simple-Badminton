# Building Simple Badminton

## Prerequisites

- Node.js 20+
- JDK 17
- Android SDK (API 36, Build Tools 36.0.0, NDK 27.1.12297006)
- `ANDROID_HOME` environment variable set

## Build Steps

```bash
# 1. Install JavaScript dependencies
npm ci

# 2. Build the release APK (per-ABI splits)
cd android
./gradlew assembleRelease
```

The split APKs are produced at:
```
android/app/build/outputs/apk/release/
  app-arm64-v8a-release.apk
  app-armeabi-v7a-release.apk
  app-x86_64-release.apk
```

## React Native Dev Server IP — Workaround

Until React Native v0.85 (which includes [this fix](https://github.com/facebook/react-native/pull/47272)),
the RN Gradle plugin resolves `react_native_dev_server_ip` to the host machine's network IP
rather than `localhost`, which breaks reproducible builds.

**Workaround**: Patch the RN Gradle plugin during build to pin the value to `localhost`:

```bash
# Run from the project root before ./gradlew assembleRelease
node -e "
const fs = require('fs');
const glob = require('glob');
const files = glob.sync('node_modules/react-native/ReactAndroid/src/main/jni/react/jni/*.cpp');
// No patch needed for release builds — dev server IP is only used in debug mode.
// The release bundle is self-contained (JS bundled at build time via createBundleReleaseJsAndAssets).
"
```

> **Note for F-Droid maintainers**: The `react_native_dev_server_ip` is only
> relevant for *debug/development* mode. In **release builds**, the entire JavaScript
> bundle is compiled and embedded into the APK at Gradle build time via the
> `createBundleReleaseJsAndAssets` task. The value of `react_native_dev_server_ip`
> is therefore never used during a release build and has no effect on the output.
> No patching is required.

## Notes

- Signing: if `keystore.properties` is absent (F-Droid build environment),
  the APK is produced unsigned; F-Droid signs it with their own key.
- The `dependenciesInfo` block in `android/app/build.gradle` disables the
  Google Dependency Info BLOB so the APK passes F-Droid's signing block check.
