package com.arlearningapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript.
   */
  override fun getMainComponentName(): String = "ARLearningApp"

  /**
   * Use a plain ReactActivityDelegate to completely avoid loading any New Architecture
   * JNI libraries (libreact_featureflagsjni.so etc.) which are not bundled when
   * newArchEnabled=false.  DefaultReactActivityDelegate unconditionally triggers
   * ReactNativeNewArchitectureFeatureFlags.enableBridgelessArchitecture() even when
   * fabricEnabled=false, causing a fatal UnsatisfiedLinkError on startup.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegate(this, mainComponentName)
}
