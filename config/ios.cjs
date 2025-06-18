module.exports = {
  appleTeamId: process.env.EXPO_PUBLIC_APPLE_TEAM_ID,
  icon: './src/assets/images/keeper-icon.png',
  usesAppleSignIn: true,
  supportsTablet: true,
  entitlements: { 'aps-environment': 'development' },
  bundleIdentifier: 'com.keeper.love',
  infoPlist: {
    ITSAppUsesNonExemptEncryption: false,
    CFBundleURLTypes: [{ CFBundleURLSchemes: [process.env.EXPO_PUBLIC_GOOGLE_URL_SCHEME] }],
    NSAppTransportSecurity: {
      NSAllowsArbitraryLoads: true
    }
  }
};
