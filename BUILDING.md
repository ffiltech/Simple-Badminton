# Building Simple Badminton

## Automated Build (GitHub Actions — Recommended)

Every push to a version tag (e.g. `v1.0.6`) triggers the **Build Release APKs** workflow on GitHub Actions (Linux). The unsigned APKs are attached automatically to the corresponding GitHub Release.

To trigger a release build:
```bash
git tag v1.0.7   # bump as appropriate
git push origin v1.0.7
```

The workflow runs at: `https://github.com/ffiltech/Simple-Badminton/actions`

---

## Local Build

### Prerequisites

- Node.js 20+
- JDK 17
- Android SDK with:
  - Platform API 35
  - Build Tools 35.0.0
  - NDK 27.1.12297006
- `ANDROID_HOME` environment variable pointing to the SDK

### Steps

```bash
# Install JavaScript dependencies
npm ci

# Patch the RN Gradle plugin to pin dev-server IP to localhost
sed -i 's/"react_native_dev_server_ip", getHostIpAddress()/"react_native_dev_server_ip", "localhost"/g' \
  node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/AgpConfiguratorUtils.kt

# Build per-ABI release APKs (--init-script disables ELF build IDs)
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon --init-script no-build-id.gradle
```

Output APKs:
```
android/app/build/outputs/apk/release/
  app-arm64-v8a-release-unsigned.apk
  app-armeabi-v7a-release-unsigned.apk
  app-x86_64-release-unsigned.apk
```

---

## Reproducible Build Properties

### react_native_dev_server_ip

React Native normally bakes the build machine's LAN IP into the APK as the
`react_native_dev_server_ip` string resource, making builds non-reproducible.

**Fixes applied (belt + braces):**

1. `android/gradle.properties`:
   ```properties
   reactNativeDevServerIp=localhost
   ```
2. `android/app/src/main/res/values/strings.xml` defines the resource directly:
   ```xml
   <string name="react_native_dev_server_ip" translatable="false">localhost</string>
   ```

Both ensure the value is always `localhost`, regardless of which machine performs the build.

See [RN PR #55531](https://github.com/facebook/react-native/pull/55531) — once merged into a stable RN release, these workarounds become no-ops.

### ELF Build IDs in native libraries

The Android NDK linker normally embeds a SHA-1 Build ID in every `.so` file. This hash
changes when the cmake version or ANDROID_HOME path differs between build environments,
making native libraries non-reproducible.

**Fix:** `android/no-build-id.gradle` is a Gradle init script that appends
`-DCMAKE_SHARED_LINKER_FLAGS_INIT=-Wl,--build-id=none` to the cmake configuration
of **every** Android sub-project (app, expo-modules-core, react-native-screens, etc.).

It must be passed when invoking Gradle:
```bash
./gradlew assembleRelease --no-daemon --init-script no-build-id.gradle
```

### PNG crunching

`android.enablePngCrunchInReleaseBuilds=false` is set in `gradle.properties`.
PNG crunching is non-deterministic and is disabled for reproducible builds.

### EAS project ID

`app.config.js` sets `extra.eas = {}` — no EAS project ID is embedded.
The APK must be built with `./gradlew` directly, **not** via `eas build`.

---

## Signing

If `keystore.properties` is absent (F-Droid / GitHub Actions environment), the APKs are
produced **unsigned**. IzzyOnDroid and F-Droid sign them with their own key.
