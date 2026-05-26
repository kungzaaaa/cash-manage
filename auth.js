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
    btnLogout: document.getElementById('btn-logout'),

    // Profile Settings Modal
    profileModalOverlay: document.getElementById('profile-modal-overlay'),
    profileForm: document.getElementById('profile-form'),
    profileDisplayName: document.getElementById('profile-display-name'),
    profileEmail: document.getElementById('profile-email'),
    profilePicInput: document.getElementById('profile-pic-input'),
    profileAvatarPreview: document.getElementById('profile-avatar-preview'),
    profilePicError: document.getElementById('profile-pic-error'),
    btnProfileCancel: document.getElementById('profile-modal-cancel'),
    btnProfileClose: document.getElementById('profile-modal-close'),
    btnDeleteAccount: document.getElementById('btn-delete-account'),

    // Delete Confirmation Modal
    deleteConfirmModalOverlay: document.getElementById('delete-confirm-modal-overlay'),
    deleteConfirmClose: document.getElementById('delete-confirm-close'),
    deleteConfirmCancel: document.getElementById('delete-confirm-cancel'),
    deleteConfirmForm: document.getElementById('delete-confirm-form'),
    deleteConfirmText: document.getElementById('delete-confirm-text'),
    deleteConfirmEmail: document.getElementById('delete-confirm-email'),
    deleteErrorMessage: document.getElementById('delete-error-message'),
    btnConfirmDelete: document.getElementById('btn-confirm-delete-account'),
    btnConfirmDeleteText: document.getElementById('btn-confirm-delete-text')
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
// Profile Management & Account Deletion Logic
// ---------------------------------------------------------------
let selectedProfilePicBase64 = null;
let deleteCountdownInterval = null;

// Open Profile & Account Settings Modal
function openProfileModal() {
    const user = auth.currentUser;
    if (!user) {
        if (typeof showToast === 'function') showToast('กรุณาเข้าสู่ระบบก่อน', 'danger');
        return;
    }

    // Set input values
    authElements.profileDisplayName.value = user.displayName || '';
    authElements.profileEmail.value = user.email || '';

    // Set avatar preview
    if (user.photoURL) {
        authElements.profileAvatarPreview.src = user.photoURL;
    } else {
        authElements.profileAvatarPreview.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}`;
    }

    // Reset temporary variables and error message
    selectedProfilePicBase64 = null;
    authElements.profilePicError.classList.add('hidden');
    authElements.profilePicError.textContent = '';
    authElements.profilePicInput.value = '';

    // Show modal
    authElements.profileModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock background scroll

    // Refresh Lucide icons in modal
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Close Profile Modal
function closeProfileModal() {
    authElements.profileModalOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // Unlock background scroll
    authElements.profileForm.reset();
}

// Handle local image file loading & size validation
function handleProfilePicSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate if it is an image
    if (!file.type.startsWith('image/')) {
        authElements.profilePicError.textContent = 'กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง';
        authElements.profilePicError.classList.remove('hidden');
        return;
    }

    // Validate size (800KB = 819,200 bytes)
    if (file.size > 800 * 1024) {
        authElements.profilePicError.textContent = 'ขนาดรูปภาพต้องไม่เกิน 800KB (กรุณาเลือกรูปภาพอื่น)';
        authElements.profilePicError.classList.remove('hidden');
        return;
    }

    // Read and convert to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
        selectedProfilePicBase64 = event.target.result;
        authElements.profileAvatarPreview.src = selectedProfilePicBase64;
        authElements.profilePicError.classList.add('hidden');
        authElements.profilePicError.textContent = '';
    };
    reader.onerror = () => {
        authElements.profilePicError.textContent = 'เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ';
        authElements.profilePicError.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Save Profile Updates to Firebase and Firestore
async function saveUserProfileData(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newDisplayName = authElements.profileDisplayName.value.trim();
    if (!newDisplayName) {
        if (typeof showToast === 'function') showToast('กรุณากรอกชื่อ-นามสกุล', 'danger');
        return;
    }

    // Show app loading overlay
    authElements.loadingOverlay.classList.remove('hidden');

    try {
        const updateData = { displayName: newDisplayName };
        if (selectedProfilePicBase64) {
            updateData.photoURL = selectedProfilePicBase64;
        }

        // 1. Update Firebase Auth Profile
        await user.updateProfile(updateData);

        // 2. Update Firestore User Document
        const userDocRef = db.collection('users').doc(user.uid);
        await userDocRef.set({
            displayName: newDisplayName,
            photoURL: selectedProfilePicBase64 || user.photoURL || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 3. Update Current Session UI Header
        authElements.userName.textContent = newDisplayName;
        if (updateData.photoURL) {
            authElements.userAvatar.src = updateData.photoURL;
            authElements.userAvatar.style.display = 'block';
        }

        if (typeof showToast === 'function') showToast('อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว', 'success');
        closeProfileModal();
    } catch (error) {
        console.error('Error updating profile:', error);
        if (typeof showToast === 'function') showToast('ไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาลองใหม่', 'danger');
    } finally {
        authElements.loadingOverlay.classList.add('hidden');
    }
}

// Open Delete Account Confirmation Modal with Security Countdown
function openDeleteConfirmModal() {
    // Hide profile modal first
    authElements.profileModalOverlay.classList.add('hidden');

    // Clear confirm form inputs
    authElements.deleteConfirmText.value = '';
    authElements.deleteConfirmEmail.value = '';
    authElements.deleteErrorMessage.classList.add('hidden');
    authElements.deleteErrorMessage.textContent = '';

    // Lock the delete confirmation button initially
    authElements.btnConfirmDelete.disabled = true;

    // Show confirmation modal
    authElements.deleteConfirmModalOverlay.classList.remove('hidden');

    // Security Countdown setup
    let countdown = 5;
    authElements.btnConfirmDeleteText.textContent = `กรุณารอยืนยัน... (${countdown})`;

    // Clear any existing intervals
    if (deleteCountdownInterval) clearInterval(deleteCountdownInterval);

    deleteCountdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            authElements.btnConfirmDeleteText.textContent = `กรุณารอยืนยัน... (${countdown})`;
        } else {
            clearInterval(deleteCountdownInterval);
            deleteCountdownInterval = null;
            authElements.btnConfirmDeleteText.textContent = 'ยืนยันการลบบัญชี';
            // Trigger check to see if text inputs are already valid and unlock button
            validateDeleteInputs();
        }
    }, 1000);
}

// Close Delete Confirmation Modal
function closeDeleteConfirmModal() {
    if (deleteCountdownInterval) {
        clearInterval(deleteCountdownInterval);
        deleteCountdownInterval = null;
    }
    authElements.deleteConfirmModalOverlay.classList.add('hidden');
    // Restore profile settings modal
    authElements.profileModalOverlay.classList.remove('hidden');
}

// Real-time Validation for Delete inputs
function validateDeleteInputs() {
    // If the countdown is still running, do not unlock
    if (deleteCountdownInterval !== null) {
        authElements.btnConfirmDelete.disabled = true;
        return;
    }

    const confirmWord = authElements.deleteConfirmText.value.trim();
    const confirmEmail = authElements.deleteConfirmEmail.value.trim();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    // Requirements: typed "DELETE" exactly, and email matches current user email
    const isTextValid = confirmWord === 'DELETE';
    const isEmailValid = confirmEmail.toLowerCase() === currentUser.email.toLowerCase();

    if (isTextValid && isEmailValid) {
        authElements.btnConfirmDelete.disabled = false;
    } else {
        authElements.btnConfirmDelete.disabled = true;
    }
}

// Execute complete Account Deletion and data scrubbing
async function executeDeleteAccount(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    // Additional final confirmation check
    const confirmWord = authElements.deleteConfirmText.value.trim();
    const confirmEmail = authElements.deleteConfirmEmail.value.trim();
    if (confirmWord !== 'DELETE' || confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
        authElements.deleteErrorMessage.textContent = 'ข้อมูลยืนยันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
        authElements.deleteErrorMessage.classList.remove('hidden');
        return;
    }

    authElements.deleteErrorMessage.classList.add('hidden');
    authElements.loadingOverlay.classList.remove('hidden');

    try {
        // 1. Scrub/Delete user's financial transactions in Firestore
        const txDocRefs = await db.collection('users').doc(user.uid).collection('transactions').get();
        if (!txDocRefs.empty) {
            const batch = db.batch();
            txDocRefs.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // 2. Delete user's profile database document in Firestore
        await db.collection('users').doc(user.uid).delete();

        // 3. Delete user account in Firebase Authentication
        await user.delete();

        // Success: Auth state listener will handle UI redirect to login automatically
        authElements.deleteConfirmModalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        if (typeof showToast === 'function') showToast('ลบบัญชีผู้ใช้และล้างข้อมูลธุรกรรมสำเร็จแล้ว', 'success');
    } catch (error) {
        console.error('Error deleting account:', error);

        // Handle security sensitive operation recent login requirement
        if (error.code === 'auth/requires-recent-login') {
            authElements.deleteErrorMessage.innerHTML = `
                <div style="line-height: 1.5; padding: 6px;">
                    <strong>⚠️ เกิดข้อผิดพลาดด้านความปลอดภัยสูงสุด:</strong><br>
                    เพื่อความปลอดภัยในการป้องกันบัญชีและข้อมูลของคุณ กรุณา <strong>"ออกจากระบบ"</strong> แล้วทำการ <strong>"เข้าสู่ระบบใหม่อีกครั้ง"</strong> จากนั้นจึงจะสามารถเข้ามาดำเนินการลบบัญชีนี้ได้ตามปกติครับ
                </div>
            `;
            authElements.deleteErrorMessage.classList.remove('hidden');
        } else {
            authElements.deleteErrorMessage.textContent = 'ไม่สามารถลบบัญชีได้เนื่องจากข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';
            authElements.deleteErrorMessage.classList.remove('hidden');
        }
    } finally {
        authElements.loadingOverlay.classList.add('hidden');
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

    // -------------------------------------------------------------
    // Profile & Account Settings Events
    // -------------------------------------------------------------

    // Open profile settings when clicking header avatar/name
    authElements.userProfileSection.addEventListener('click', openProfileModal);

    // Close profile settings
    authElements.btnProfileClose.addEventListener('click', closeProfileModal);
    authElements.btnProfileCancel.addEventListener('click', closeProfileModal);

    // Profile pic edit button click simulations
    authElements.profileAvatarPreview.addEventListener('click', () => authElements.profilePicInput.click());
    document.getElementById('btn-upload-avatar').addEventListener('click', () => authElements.profilePicInput.click());

    // Profile pic input changes
    authElements.profilePicInput.addEventListener('change', handleProfilePicSelection);

    // Submit profile updates form
    authElements.profileForm.addEventListener('submit', saveUserProfileData);

    // Open Delete Account confirm modal
    authElements.btnDeleteAccount.addEventListener('click', openDeleteConfirmModal);

    // Close Delete Confirmation Modal
    authElements.deleteConfirmClose.addEventListener('click', closeDeleteConfirmModal);
    authElements.deleteConfirmCancel.addEventListener('click', closeDeleteConfirmModal);

    // Real-time input validation for DELETE confirm form
    authElements.deleteConfirmText.addEventListener('input', validateDeleteInputs);
    authElements.deleteConfirmEmail.addEventListener('input', validateDeleteInputs);

    // Execute Delete Account form submission
    authElements.deleteConfirmForm.addEventListener('submit', executeDeleteAccount);
});
