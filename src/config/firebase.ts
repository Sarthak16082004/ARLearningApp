import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Note: No extra configuration needed for @react-native-firebase
// as it automatically picks up settings from google-services.json/GoogleService-Info.plist

export const db = firestore();
export const bucket = storage();

export const COLLECTIONS = {
    AR_CONTENT: 'ar_content',
    SESSIONS: 'sessions', // for multi-user session tracking if needed
};

export const STORAGE_FOLDERS = {
    MODELS: 'ar_models',
    PREVIEWS: 'ar_previews',
};

export default firebase;
