import firebase from "firebase/app";
// Add the Firebase services that you want to use
import "firebase/firebase-storage";

// TODO: Replace the following with your app's Firebase project configuration
// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field
export const firebaseConfig = {
  apiKey: "AIzaSyA0Pufavx7XCvoY3YZNxRc9Yfq1bmWPQI8",
  authDomain: "caseityourself.firebaseapp.com",
  projectId: "caseityourself",
  storageBucket: "caseityourself.appspot.com",
  messagingSenderId: "381223470540",
  appId: "1:381223470540:web:3b1da5c656f710af598969",
  measurementId: "G-H89CQKV466",
};

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

export default firebase;
