const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);

const config = {
    resolver: {
        blockList: [
            // Block vision-camera's transient C++ CMake build dirs.
            // Metro's FallbackWatcher (used on Windows) throws ENOENT
            // when it tries to watch these short-lived temp directories.
            /node_modules[/\\]react-native-vision-camera[/\\]android[/\\]\.cxx[/\\].*/,
            /node_modules[/\\]react-native-vision-camera[/\\]android[/\\]build[/\\].*/,
        ],
    },
};

module.exports = mergeConfig(defaultConfig, config);
