const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'ws' || moduleName.startsWith('ws/')) {
    return {
      filePath: require.resolve('./shims/ws.js'),
      type: 'sourceFile',
    }
  }
  if (moduleName === '@opentelemetry/api') {
    return {
      filePath: require.resolve('./shims/opentelemetry-api.js'),
      type: 'sourceFile',
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config