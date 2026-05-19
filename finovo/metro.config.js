const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@opentelemetry/api': require.resolve('./shims/opentelemetry-api.js'),
}

module.exports = config;