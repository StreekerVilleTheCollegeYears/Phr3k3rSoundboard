# Signal Soundboard for Android

This native shell packages the existing Vite app as local assets in an Android
WebView. It does not request phone, microphone, or network permissions; the
soundboard synthesizes audio on-device.

From the workspace root, run:

```sh
./artifacts/signal-soundboard/build-apk.sh
```

The script expects `adb`, Java 21, Gradle, and the Android SDK at
`.android-sdk/`. It creates a locally signed debug APK at
`generated-artifacts/signal-soundboard.apk`. This debug APK is for sideloading
and testing, not a Play Store release.
