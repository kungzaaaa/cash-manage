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

    // Profile Modal
    profileModalOverlay: document.getElementById('profile-modal-overlay'),
    profileModalClose: document.getElementById('profile-modal-close'),
    profileModalCancel: document.getElementById('profile-modal-cancel'),
    profileForm: document.getElementById('profile-form'),
    profileFirstname: document.getElementById('profile-firstname'),
    profileLastname: document.getElementById('profile-lastname'),
    profileDob: document.getElementById('profile-dob'),
    profileAvatarInput: document.getElementById('profile-avatar-input'),
    profileAvatarPreview: document.getElementById('profile-avatar-preview'),
    btnDeleteAccount: document.getElementById('btn-delete-account')
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
// Profile Management (Edit & Avatar)
// ---------------------------------------------------------------
let profileAvatarBase64 = null;

async function loadUserProfile(user) {
    if (!user) return null;
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            return doc.data();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
    return null;
}

async function updateUserProfile(user, data) {
    if (!user) return;
    try {
        const updateData = {
            firstname: data.firstname || '',
            lastname: data.lastname || '',
            dob: data.dob || '',
        };
        // Update displayName for Auth if firstname is provided
        if (data.firstname) {
            const displayName = data.lastname ? `${data.firstname} ${data.lastname}` : data.firstname;
            await user.updateProfile({ displayName: displayName });
            updateData.displayName = displayName;
        }
        if (data.photoBase64) {
            updateData.photoURL = data.photoBase64;
            await user.updateProfile({ photoURL: data.photoBase64 });
        }
        
        await db.collection('users').doc(user.uid).set(updateData, { merge: true });
        
        // Refresh UI
        showApp(user);
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
}

// Utility to resize image and convert to Base64 (max width 300px)
function resizeImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to webp for smaller size, quality 0.7
            const dataUrl = canvas.toDataURL('image/webp', 0.7);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ---------------------------------------------------------------
// Delete Account
// ---------------------------------------------------------------
async function deleteUserAccount(user) {
    if (!user) return;
    try {
        const uid = user.uid;
        
        // 1. Delete all transactions
        const txSnapshot = await db.collection('users').doc(uid).collection('transactions').get();
        const batch = db.batch();
        txSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // 2. Delete user profile document
        await db.collection('users').doc(uid).delete();

        // 3. Delete Auth account
        await user.delete();
        
        // User is signed out automatically by onAuthStateChanged
        return true;
    } catch (error) {
        console.error('Error deleting account:', error);
        // Requires recent login
        if (error.code === 'auth/requires-recent-login') {
            alert('เพื่อความปลอดภัย กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้งก่อนทำการลบบัญชี');
        } else {
            alert('เกิดข้อผิดพลาดในการลบบัญชี: ' + error.message);
        }
        throw error;
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
    // Profile UI Event Listeners
    // -------------------------------------------------------------
    function closeProfileModal() {
        authElements.profileModalOverlay.classList.add('hidden');
    }

    async function openProfileModal() {
        const user = auth.currentUser;
        if (!user) return;
        
        // Reset state
        profileAvatarBase64 = null;
        authElements.profileForm.reset();
        
        // Default avatar or user avatar
        if (user.photoURL) {
            authElements.profileAvatarPreview.innerHTML = `<img src="${user.photoURL}" alt="Profile">`;
        } else {
            authElements.profileAvatarPreview.innerHTML = `<i data-lucide="user" class="default-avatar-icon"></i>`;
            lucide.createIcons();
        }

        // Load data from Firestore
        const profileData = await loadUserProfile(user);
        if (profileData) {
            authElements.profileFirstname.value = profileData.firstname || '';
            authElements.profileLastname.value = profileData.lastname || '';
            authElements.profileDob.value = profileData.dob || '';
        } else {
            // Fallback to Auth display name
            if (user.displayName) {
                const parts = user.displayName.split(' ');
                authElements.profileFirstname.value = parts[0] || '';
                authElements.profileLastname.value = parts.slice(1).join(' ') || '';
            }
        }

        authElements.profileModalOverlay.classList.remove('hidden');
    }

    // Open Modal
    authElements.userProfileSection.addEventListener('click', openProfileModal);

    // Close Modal
    authElements.profileModalClose.addEventListener('click', closeProfileModal);
    authElements.profileModalCancel.addEventListener('click', closeProfileModal);
    authElements.profileModalOverlay.addEventListener('click', (e) => {
        if (e.target === authElements.profileModalOverlay) closeProfileModal();
    });

    // Avatar File Input Change
    authElements.profileAvatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check size (e.g. max 5MB for upload before resize)
            if (file.size > 5 * 1024 * 1024) {
                alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 5MB');
                return;
            }
            
            // Resize and preview
            resizeImageToBase64(file, (base64) => {
                profileAvatarBase64 = base64;
                authElements.profileAvatarPreview.innerHTML = `<img src="${base64}" alt="Preview">`;
            });
        }
    });

    // Save Profile Form
    authElements.profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div><span> กำลังบันทึก...</span>';

        try {
            await updateUserProfile(user, {
                firstname: authElements.profileFirstname.value.trim(),
                lastname: authElements.profileLastname.value.trim(),
                dob: authElements.profileDob.value,
                photoBase64: profileAvatarBase64
            });
            closeProfileModal();
            // Show toast from app.js if available
            if (typeof showToast === 'function') {
                showToast('อัปเดตโปรไฟล์เรียบร้อยแล้ว', 'success');
            } else {
                alert('อัปเดตโปรไฟล์เรียบร้อยแล้ว');
            }
        } catch (error) {
            alert('ไม่สามารถอัปเดตโปรไฟล์ได้');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i data-lucide="save"></i><span>บันทึก</span>';
            lucide.createIcons();
        }
    });

    // Delete Account Button
    authElements.btnDeleteAccount.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;

        const confirm1 = confirm('คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?');
        if (!confirm1) return;

        const confirm2 = confirm('ข้อมูลรายรับ-รายจ่ายทั้งหมดจะถูกลบอย่างถาวร และไม่สามารถกู้คืนได้ ยืนยันการลบหรือไม่?');
        if (!confirm2) return;

        try {
            closeProfileModal();
            if (typeof showToast === 'function') {
                showToast('กำลังลบข้อมูลและบัญชีผู้ใช้...', 'warning');
            }
            
            await deleteUserAccount(user);
            
            // After successful deletion, Firebase auth observer will catch logout
            if (typeof showToast === 'function') {
                showToast('ลบบัญชีสำเร็จแล้ว', 'info');
            } else {
                alert('ลบบัญชีสำเร็จแล้ว');
            }
        } catch (error) {
            // Error is handled in deleteUserAccount function
        }
    });
});
