package com.arlearningapp

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        // New Architecture explicitly disabled — ViroReact requires Old Arch.
        // Do NOT set this to true without also enabling newArchEnabled in gradle.properties
        override val isNewArchEnabled: Boolean = false
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  /**
   * reactHost is ONLY required by the New Architecture Bridgeless mode.
   * We override it to return a no-op stub so getDefaultReactHost() is never called —
   * that helper loads libreact_featureflagsjni.so which is absent when newArchEnabled=false.
   */
  override val reactHost: ReactHost
    get() = throw UnsupportedOperationException("New Architecture is disabled")

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    // Do NOT call load() or getDefaultReactHost() here — they require New Arch native libs
  }
}
