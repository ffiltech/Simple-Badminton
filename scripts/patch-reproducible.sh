#!/usr/bin/env bash
# patch-reproducible.sh – apply all patches needed for a reproducible Android build.
#
# Run this from the project root (the directory containing package.json) AFTER
# npm ci, before invoking Gradle.  Both the project's own CI (GitHub Actions) and
# any third-party rebuilder (e.g. IzzyOnDroid) should call this script so that
# the exact same patches are applied on every build host.
#
#   bash scripts/patch-reproducible.sh
#
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"
cd "$ROOT"

echo "=== patch-reproducible.sh starting (root: $ROOT) ==="

# ---------------------------------------------------------------------------
# 1.  React Native Gradle Plugin – pin dev-server IP to localhost
#
#     The RN Gradle Plugin calls getHostIpAddress() which bakes the builder's
#     LAN IP into the 'react_native_dev_server_ip' string resource, making
#     resources.arsc non-reproducible.  Upstream fix was merged 2026-02-13
#     (targeting RN 0.85, not yet released at the time of writing).
# ---------------------------------------------------------------------------
RN_PLUGIN_FILE=$(find node_modules/@react-native/gradle-plugin \
    -name "AgpConfiguratorUtils.kt" 2>/dev/null | head -1)

if [ -n "$RN_PLUGIN_FILE" ]; then
    sed -i 's/"react_native_dev_server_ip", getHostIpAddress()/"react_native_dev_server_ip", "localhost"/g' \
        "$RN_PLUGIN_FILE"
    echo "patched (dev-server IP): $RN_PLUGIN_FILE"
else
    echo "WARNING: AgpConfiguratorUtils.kt not found – skipping dev-server IP patch"
fi

# ---------------------------------------------------------------------------
# 2.  CMakeLists.txt – strip ANDROID_HOME from DWARF debug info + disable
#     ELF build IDs.
#
#     The NDK compiler (clang) embeds the absolute ANDROID_HOME / NDK path in
#     DWARF debug sections.  Because different build hosts use different SDK
#     install locations (e.g. /opt/sdk vs /usr/local/lib/android/sdk) those
#     embedded paths differ, which in turn changes the SHA-1 Build ID that lld
#     writes into .note.gnu.build-id, making the .so files non-reproducible.
#
#     -ffile-prefix-map=$ENV{ANDROID_HOME}=  strips the NDK host path at
#       compile time (cmake evaluates $ENV{...} during configuration).
#     -Wl,--build-id=none  removes the ELF build-id section entirely.
# ---------------------------------------------------------------------------
CMAKE_PATCH=$(printf '\n# reproducible-builds (added by scripts/patch-reproducible.sh)\nif(ANDROID)\n  add_compile_options(-ffile-prefix-map=$ENV{ANDROID_HOME}=)\n  add_link_options(-Wl,--build-id=none)\nendif()\n')

CMAKE_FILES=(
    "node_modules/expo-modules-core/android/CMakeLists.txt"
    "node_modules/expo-modules-core/android/src/fabric/CMakeLists.txt"
    "node_modules/react-native-safe-area-context/android/src/main/jni/CMakeLists.txt"
    "node_modules/react-native-screens/android/CMakeLists.txt"
    "node_modules/react-native-screens/android/src/main/jni/CMakeLists.txt"
    "node_modules/react-native-svg/android/src/main/jni/CMakeLists.txt"
)

for f in "${CMAKE_FILES[@]}"; do
    if [ -f "$f" ]; then
        # Guard against double-patching (e.g. if the script is called twice)
        if grep -q "reproducible-builds" "$f" 2>/dev/null; then
            echo "already patched (cmake): $f"
        else
            printf '%s\n' "$CMAKE_PATCH" >> "$f"
            echo "patched (cmake): $f"
        fi
    else
        echo "not found (ok): $f"
    fi
done

echo "=== patch-reproducible.sh done ==="
