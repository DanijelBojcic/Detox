package com.wix.detox.systeminfo;

import android.os.Build;
import android.util.Log;

public class Environment {
    public static final String DEVICE_LOCALHOST = "ws://localhost";
    public static final String EMULATOR_LOCALHOST = "ws://10.0.2.2";
    public static final String GENYMOTION_LOCALHOST = "ws://10.0.3.2";
    public static final String GENYMOTION_CLOUD_LOCALHOST = DEVICE_LOCALHOST;

    private static boolean isRunningOnGenymotion() {
        return Build.FINGERPRINT.contains("vbox")
                || Build.MANUFACTURER.contains("Genymotion");
    }

    private static boolean isRunningOnGenycloud() {
        return isRunningOnGenymotion()
                && Build.MODEL.startsWith("Detox"); // Model is set to instance name, provided by the (JS) Detox-tester code
    }

    private static boolean isRunningOnStockEmulator() {
        return Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || "google_sdk".equals(Build.PRODUCT);
    }

    public static String getServerHost() {
        if (isRunningOnGenycloud()) {
            return GENYMOTION_CLOUD_LOCALHOST;
        }

        if (isRunningOnGenymotion()) {
            return GENYMOTION_LOCALHOST;
        }

        if (isRunningOnStockEmulator()) {
            return EMULATOR_LOCALHOST;
        }

        return DEVICE_LOCALHOST;
    }
}
