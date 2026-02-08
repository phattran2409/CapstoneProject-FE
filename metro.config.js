const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Improve Metro bundler performance and stability
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return middleware;
  },
};

// Increase timeout for large projects
config.watchFolders = [__dirname];

module.exports = config;

