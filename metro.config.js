const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve sql and wasm since they primarily run on web environment
config.resolver.sourceExts.push('sql');
config.resolver.sourceExts.push('wasm');

module.exports = config;
