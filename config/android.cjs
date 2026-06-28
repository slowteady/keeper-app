module.exports = {
  package: 'com.keeper.love',
  googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.keeper.love',
  adaptiveIcon: { foregroundImage: './src/assets/images/keeper-android-icon.png' },
  permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION'],
  intentFilters: [
    {
      action: 'VIEW',
      autoVerify: true,
      data: [{ scheme: 'https', host: 'our-keeper.com', pathPrefix: '/share' }],
      category: ['BROWSABLE', 'DEFAULT']
    }
  ]
};
