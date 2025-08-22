export const environment = {
  production: false,

  firebaseConfig: {
    apiKey: process.env.NG_APP_FIREBASE_API_KEY,
    authDomain: process.env.NG_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NG_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NG_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NG_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NG_APP_FIREBASE_APP_ID,
    measurementId: process.env.NG_APP_FIREBASE_MEASUREMENT_ID,
  },
  removeBgApiKey: process.env.NG_APP_REMOVE_BG_API_KEY,
  cloudinary: {
    cloudName: process.env.NG_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NG_APP_CLOUDINARY_UPLOAD_PRESET,
  },
};