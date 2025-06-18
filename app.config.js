import 'dotenv/config';
import { version as pkgVersion } from './package.json';

const iosConfig = require('./config/ios.cjs');
const androidConfig = require('./config/android.cjs');
const plugins = require('./config/plugins.cjs');

export default () => ({
  expo: {
    name: 'keeper',
    slug: 'keeper',
    version: pkgVersion,
    orientation: 'portrait',
    scheme: 'keeper',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: iosConfig,
    android: androidConfig,
    plugins,
    experiments: { typedRoutes: true },
    extra: { eas: { projectId: '6a4a1356-b842-4472-b78e-e1bebffeb444' } },
    updates: {
      url: 'https://u.expo.dev/6a4a1356-b842-4472-b78e-e1bebffeb444'
    },
    runtimeVersion: {
      policy: 'appVersion'
    }
  }
});
