import { ExpoConfig, ConfigContext } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => {
  const api = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080";
  const url = new URL(api),
    production = process.env.EAS_BUILD_PROFILE === "production";
  const local =
    /^(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(
      url.hostname,
    );
  if (url.protocol !== "https:" && (!local || production))
    throw new Error(
      "Set EXPO_PUBLIC_API_URL to your hosted HTTPS backend before a production build.",
    );
  return {
    ...config,
    name: "Caremonitor by Aniprotech",
    slug: "aniprotech-mobile",
    plugins: [
      "expo-secure-store",
      ["expo-splash-screen", { image: "./assets/splash-icon.png", imageWidth: 320, resizeMode: "contain", backgroundColor: "#071A33" }],
      ["expo-image-picker", { "photosPermission": "Allow Caremonitor to attach care evidence to an assigned visit.", "cameraPermission": "Allow Caremonitor to take a photo for an assigned visit." }],
      ["expo-location", { "locationWhenInUsePermission": "Allow Caremonitor to record location when you check in or out of an assigned visit." }],
      ["expo-speech-recognition", { microphonePermission: "Allow Caremonitor to convert caregiver speech into editable visit text.", speechRecognitionPermission: "Allow Caremonitor to convert caregiver speech into editable visit text." }],
      [
        "expo-build-properties",
        { android: { usesCleartextTraffic: !production && local } },
      ],
    ],
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        ...(!production
          ? {
              NSLocalNetworkUsageDescription:
                "Connect to your Caremonitor development server on this Wi-Fi network.",
              NSAppTransportSecurity: { NSAllowsLocalNetworking: true },
            }
          : {}),
      },
    },
  };
};
