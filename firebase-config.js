/**
 * Firebase Configuration
 * Cash & Bank Flow Tracker
 * 
 * ⚠️  คำแนะนำ: กรุณาเปลี่ยนค่า firebaseConfig ด้านล่างให้ตรงกับ Firebase Project ของท่าน
 *     โดยไปที่ Firebase Console → Project Settings → Your apps → Web App → Copy config
 */

const firebaseConfig = {
    apiKey: "AIzaSyAk7dS2GH333EBaZ1fxMw-V3Wr3KJGUvII",
    authDomain: "cash-bank-tracker.firebaseapp.com",
    projectId: "cash-bank-tracker",
    storageBucket: "cash-bank-tracker.firebasestorage.app",
    messagingSenderId: "374366334080",
    appId: "1:374366334080:web:acd022438976a046abca65",
    measurementId: "G-PXHKLJT5BJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.firestore();

// Configure Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
