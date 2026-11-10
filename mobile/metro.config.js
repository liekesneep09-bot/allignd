const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const mobileNodeModules = path.resolve(__dirname, 'node_modules');
const rootNodeModules = path.resolve(__dirname, '../node_modules');

// The DOM screens reuse the actual webapp components, styling and assets.
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(__dirname, '../src'),
];

config.resolver.nodeModulesPaths = [mobileNodeModules, rootNodeModules];

// Web and mobile have their own package trees. Always use Expo's React copies,
// including when a shared file under ../src imports React.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (/^react(?:-dom)?(?:\/.*)?$/.test(moduleName)) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [mobileNodeModules] }),
    };
  }
  if (defaultResolveRequest) return defaultResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
