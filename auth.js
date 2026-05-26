/**
 * Authentication Module
 * Cash & Bank Flow Tracker
 * 
 * Handles Google login, Email/Password login & register, and logout.
 * Uses Firebase Auth (compat SDK).
 */

// ---------------------------------------------------------------
// DOM References for Auth UI
// ---------------------------------------------------------------
const authElements = {
    authScreen: document.getElementById('auth-screen'),
    appContainer: document.getElementById('app-container'),
    loadingOverlay: document.getElementById('loading-overlay'),

    // Auth tabs
    tabLogin: document.getElementById('auth-tab-login'),
    tabRegister: document.getElementById('auth-tab-register'),
    loginFormContainer: document.getElementById('login-form-container'),
    registerFormContainer: document.getElementById('register-form-container'),

    // Google button
    btnGoogleLogin: document.getElementById('btn-google-login'),

    // Login form
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),

    // Register form
    registerForm: document.getElementById('register-form'),
    registerName: document.getElementById('register-name'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerPasswordConfirm: document.getElementById('register-password-confirm'),

    // Error display
    authError: document.getElementById('auth-error'),

    // User profile in header
    userProfileSection: document.getElementById('user-profile-section'),
    userAvatar: document.getElementById('user-avatar'),
    userName: document.getElementById('user-name'),
    btnLogout: document.getElementById('btn-logout')
};

// ---------------------------------------------------------------
// Auth State Observer — the heart of the auth system
// ---------------------------------------------------------------
auth.onAuthStateChanged(async (user) => {
    // Hide loading overlay
    authElements.loadingOverlay.classList.add('hidden');

    if (user) {
        // User is signed in
        showApp(user);

        // Save/update user profile in Firestore (first-time check)
        await saveUserProfile(user);

        // Initialize the main app with user data (defined in app.js)
        if (typeof initAppForUser === 'function') {
            await initAppForUser(user);
        }
    } else {
        // User is signed out
        showAuthScreen();

        // Clear app state (defined in app.js)
        if (typeof clearAppForLogout === 'function') {
            clearAppForLogout();
        }
    }
});

// ---------------------------------------------------------------
// Show / Hide helpers
// ---------------------------------------------------------------
function showApp(user) {
    authElements.authScreen.classList.add('hidden');
    authElements.appContainer.classList.remove('hidden');

    // Update user profile in header
    if (user.photoURL) {
        authElements.userAvatar.src = user.photoURL;
        authElements.userAvatar.style.display = 'block';
    } else {
        authElements.userAvatar.style.display = 'none';
    }
    authElements.userName.textContent = user.displayName || user.email || 'ผู้ใช้';
    authElements.userProfileSection.classList.remove('hidden');
}

function showAuthScreen() {
    authElements.authScreen.classList.remove('hidden');
    authElements.appContainer.classList.add('hidden');
    authElements.userProfileSection.classList.add('hidden');
    hideAuthError();
}

// ---------------------------------------------------------------
// Auth Error UI
// ---------------------------------------------------------------
function showAuthError(message) {
    authElements.authError.textContent = message;
    authElements.authError.classList.remove('hidden');
}

function hideAuthError() {
    authElements.authError.textContent = '';
    authElements.authError.classList.add('hidden');
}

// Map Firebase error codes to Thai messages
function getThaiErrorMessage(code) {
    const map = {
        'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น',
        'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาสมัครสมาชิกก่อน',
        'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
        'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth/popup-closed-by-user': 'การเข้าสู่ระบบถูกยกเลิก',
        'auth/network-request-failed': 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาลองใหม่',
        'auth/too-many-requests': 'มีการเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่',
        'auth/cancelled-popup-request': 'กรุณาลองกดเข้าสู่ระบบอีกครั้ง'
    };
    return map[code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
}

// ---------------------------------------------------------------
// Login with Google
// ---------------------------------------------------------------
async function loginWithGoogle() {
    hideAuthError();
    try {
        await auth.signInWithPopup(googleProvider);
    } catch (error) {
        console.error('Google login error:', error);
        showAuthError(getThaiErrorMessage(error.code));
    }
}

// ---------------------------------------------------------------
// Login with Email/Password
// ---------------------------------------------------------------
async function loginWithEmail(email, password) {
    hideAuthError();
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Email login error:', error);
        showAuthError(getThaiErrorMessage(error.code));
    }
}

// ---------------------------------------------------------------
// Register with Email/Password
// ---------------------------------------------------------------
async function registerWithEmail(email, password, displayName) {
    hideAuthError();
    try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        // Set display name
        if (cred.user && displayName) {
            await cred.user.updateProfile({ displayName });
        }
    } catch (error) {
        console.error('Register error:', error);
        showAuthError(getThaiErrorMessage(error.code));
    }
}

// ---------------------------------------------------------------
// Logout
// ---------------------------------------------------------------
async function logout() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// ---------------------------------------------------------------
// Save user profile to Firestore on first login
// ---------------------------------------------------------------
async function saveUserProfile(user) {
    try {
        const userDoc = db.collection('users').doc(user.uid);
        const doc = await userDoc.get();
        if (!doc.exists) {
            await userDoc.set({
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
}

// ---------------------------------------------------------------
// Auth UI Event Listeners
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    authElements.tabLogin.addEventListener('click', () => {
        authElements.tabLogin.classList.add('active');
        authElements.tabRegister.classList.remove('active');
        authElements.loginFormContainer.classList.remove('hidden');
        authElements.registerFormContainer.classList.add('hidden');
        hideAuthError();
    });

    authElements.tabRegister.addEventListener('click', () => {
        authElements.tabRegister.classList.add('active');
        authElements.tabLogin.classList.remove('active');
        authElements.registerFormContainer.classList.remove('hidden');
        authElements.loginFormContainer.classList.add('hidden');
        hideAuthError();
    });

    // Google login button
    authElements.btnGoogleLogin.addEventListener('click', loginWithGoogle);

    // Login form submit
    authElements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = authElements.loginEmail.value.trim();
        const password = authElements.loginPassword.value;
        if (!email || !password) {
            showAuthError('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }
        loginWithEmail(email, password);
    });

    // Register form submit
    authElements.registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = authElements.registerName.value.trim();
        const email = authElements.registerEmail.value.trim();
        const password = authElements.registerPassword.value;
        const confirmPassword = authElements.registerPasswordConfirm.value;

        if (!email || !password) {
            showAuthError('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }
        if (password !== confirmPassword) {
            showAuthError('รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่');
            return;
        }
        if (password.length < 6) {
            showAuthError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }
        registerWithEmail(email, password, name);
    });

    // Logout button
    authElements.btnLogout.addEventListener('click', logout);
});
