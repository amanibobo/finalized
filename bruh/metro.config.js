// Metro defaults include ttf/otf; keep woff2 for web if you load webfonts elsewhere.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('woff2')) {
  config.resolver.assetExts.push('woff2');
}
if (!config.resolver.assetExts.includes('woff')) {
  config.resolver.assetExts.push('woff');
}

module.exports = config;
