module.exports = {
  dependencies: {
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: {
          packageImportPath: 'import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;',
          packageInstance: 'new AsyncStoragePackage()',
        },
      },
    },
  },
};
