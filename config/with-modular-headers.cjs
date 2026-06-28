const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MODULAR_PODS = ['GoogleUtilities', 'RecaptchaInterop'];

module.exports = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      const contents = fs.readFileSync(podfilePath, 'utf8');

      if (contents.includes(':modular_headers => true')) return cfg;

      const injection = MODULAR_PODS.map((pod) => `  pod '${pod}', :modular_headers => true`).join('\n');
      const patched = contents.replace(/(\n\s*use_expo_modules!\n)/, `$1${injection}\n`);

      fs.writeFileSync(podfilePath, patched);
      return cfg;
    }
  ]);
