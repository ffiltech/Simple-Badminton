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

SCRIPTS_DIR="$(dirname "$0")"
ROOT="$(dirname "$SCRIPTS_DIR")"

# Resolve to absolute path so cd to a sub-dir doesn't break relative paths
ROOT="$(cd "$ROOT" && pwd)"
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
# 2.  CMakeLists.txt – strip NDK host path from DWARF debug info and remove
#     ELF build IDs from every compiled shared library.
#
#     Root cause: the NDK compiler embeds ANDROID_HOME (e.g. /opt/sdk vs
#     /usr/local/lib/android/sdk) in DWARF debug sections.  Because different
#     build hosts use different SDK install paths the embedded paths differ,
#     which changes the SHA-1 Build ID that lld writes into
#     .note.gnu.build-id, making the .so files non-reproducible.
#
#     Two-layer fix:
#       1. -ffile-prefix-map=$ENV{ANDROID_HOME}= strips the NDK host path
#          at compile time (cmake evaluates $ENV{...} during configuration).
#       2. cmake POST_BUILD custom command that calls llvm-objcopy
#          --remove-section .note.gnu.build-id on every SHARED_LIBRARY
#          target.  This is the belt-and-suspenders layer: it works even if
#          the -Wl,--build-id=none linker flag is silently swallowed by the
#          NDK toolchain file.  cmake_language(DEFER CALL … ) is used so the
#          function runs after the whole CMakeLists.txt is processed and all
#          targets are defined.
# ---------------------------------------------------------------------------

# Read the cmake snippet from a heredoc so it stays readable and easy to diff
read -r -d '' CMAKE_PATCH << 'CMAKE_PATCH_EOF' || true

# reproducible-builds (added by scripts/patch-reproducible.sh)
if(ANDROID)
  # Layer 1: strip ANDROID_HOME from DWARF debug info at compile time
  add_compile_options(-ffile-prefix-map=$ENV{ANDROID_HOME}=)
  # Layer 1b: ask the linker not to embed a Build ID (may be ignored by NDK toolchain)
  add_link_options(-Wl,--build-id=none)
  # Layer 2: belt-and-suspenders – remove .note.gnu.build-id from every
  # shared library using llvm-objcopy immediately after it is linked.
  # cmake_language(DEFER) runs after the entire directory scope is processed
  # so all add_library() targets are already registered at that point.
  if(CMAKE_VERSION VERSION_GREATER_EQUAL "3.18")
    cmake_language(DEFER CALL _rb_strip_all_build_ids "${CMAKE_CURRENT_SOURCE_DIR}")
  endif()
  function(_rb_strip_all_build_ids dir)
    # Locate the NDK's llvm-objcopy (CMAKE_OBJCOPY may not be set for all toolchains)
    find_program(_llvm_objcopy
      NAMES llvm-objcopy
      PATHS
        "${ANDROID_TOOLCHAIN_ROOT}/bin"
        "${CMAKE_ANDROID_NDK}/toolchains/llvm/prebuilt/linux-x86_64/bin"
        "${CMAKE_ANDROID_NDK}/toolchains/llvm/prebuilt/linux-x86_64/bin"
      NO_DEFAULT_PATH
    )
    if(NOT _llvm_objcopy)
      message(STATUS "[repro] llvm-objcopy not found – build IDs may remain")
      return()
    endif()
    get_property(_targets DIRECTORY "${dir}" PROPERTY BUILDSYSTEM_TARGETS)
    foreach(_t IN LISTS _targets)
      if(TARGET ${_t})
        get_target_property(_type ${_t} TYPE)
        if(_type STREQUAL "SHARED_LIBRARY")
          add_custom_command(TARGET ${_t} POST_BUILD
            COMMAND "${_llvm_objcopy}"
              --remove-section .note.gnu.build-id
              $<TARGET_FILE:${_t}>
            COMMENT "[repro] strip build-id from ${_t}"
            VERBATIM
          )
          message(STATUS "[repro] registered build-id strip POST_BUILD for: ${_t}")
        endif()
      endif()
    endforeach()
  endfunction()
endif()
CMAKE_PATCH_EOF

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
