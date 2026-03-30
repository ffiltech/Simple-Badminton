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

# Build per-ABI release APKs
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon
```

Output APKs:
```
android/app/build/outputs/apk/release/
  app-arm64-v8a-release.apk
  app-armeabi-v7a-release.apk
  app-x86_64-release.apk
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
