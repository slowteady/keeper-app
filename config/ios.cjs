module.exports = {
  appleTeamId: process.env.EXPO_PUBLIC_APPLE_TEAM_ID,
  icon: './src/assets/images/keeper-icon.png',
  usesAppleSignIn: true,
  supportsTablet: true,
  entitlements: { 'aps-environment': 'development' },
  appStoreUrl: 'https://apps.apple.com/app/id6739178024?action=write-review',
  infoPlist: {
    ITSAppUsesNonExemptEncryption: false,
    CFBundleURLTypes: [{ CFBundleURLSchemes: [process.env.EXPO_PUBLIC_GOOGLE_URL_IOS_SCHEME] }],
    NSAppTransportSecurity: {
      NSAllowsArbitraryLoads: true
    }
  }
};
