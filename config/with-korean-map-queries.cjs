const { withAndroidManifest } = require('@expo/config-plugins');

const SCHEMES = ['kakaomap', 'tmap', 'nmap', 'https'];

const schemeOf = (intentItem) => intentItem.data?.[0]?.$?.['android:scheme'] || intentItem.data?.$?.['android:scheme'];

module.exports = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.queries = manifest.queries || [{}];
    const intent = manifest.queries[0].intent || [];

    SCHEMES.forEach((scheme) => {
      if (intent.some((item) => schemeOf(item) === scheme)) return;
      intent.push({
        action: { $: { 'android:name': 'android.intent.action.VIEW' } },
        data: { $: { 'android:scheme': scheme } }
      });
    });

    manifest.queries[0].intent = intent;
    return cfg;
  });
