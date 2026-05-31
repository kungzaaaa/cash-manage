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
    btnRemoveAvatarPic: document.getElementById('btn-remove-avatar-pic'),
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
    if (user) {
        // User is signed in

        // 1. Load user profile from Firestore to fetch custom photo URL (Base64) or display name
        let firestorePhotoURL = '';
        let firestoreDisplayName = '';
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                firestorePhotoURL = data.photoURL || '';
                firestoreDisplayName = data.displayName || '';
            }
        } catch (error) {
            console.error('Error fetching user profile from Firestore:', error);
        }

        // 2. Show the main App with Firestore data priority
        showApp(user, firestorePhotoURL, firestoreDisplayName);

        // 3. Save/update user profile in Firestore (first-time check)
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

    // Hide loading overlay
    authElements.loadingOverlay.classList.add('hidden');
});

// ---------------------------------------------------------------
// Show / Hide helpers
// ---------------------------------------------------------------
function showApp(user, customPhotoURL, customDisplayName) {
    authElements.authScreen.classList.add('hidden');
    authElements.appContainer.classList.remove('hidden');

    const displayName = customDisplayName || user.displayName || user.email || 'ผู้ใช้';
    const photoURL = customPhotoURL || user.photoURL;

    // Update user profile in header
    if (photoURL) {
        authElements.userAvatar.src = photoURL;
        authElements.userAvatar.style.display = 'block';
    } else {
        // Falling back to beautiful Initials SVG if photo doesn't exist
        authElements.userAvatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
        authElements.userAvatar.style.display = 'block';
    }
    authElements.userName.textContent = displayName;
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

// Map Firebase error codes to translated messages
function getAuthErrorMessage(code) {
    const map = {
        'auth/email-already-in-use': t('auth.error.email_in_use'),
        'auth/invalid-email': t('auth.error.invalid_email'),
        'auth/user-not-found': t('auth.error.user_not_found'),
        'auth/wrong-password': t('auth.error.wrong_password'),
        'auth/invalid-credential': t('auth.error.invalid_credential'),
        'auth/weak-password': t('auth.error.weak_password'),
        'auth/popup-closed-by-user': t('auth.error.popup_closed'),
        'auth/network-request-failed': t('auth.error.network'),
        'auth/too-many-requests': t('auth.error.too_many'),
        'auth/cancelled-popup-request': t('auth.error.cancelled_popup')
    };
    return map[code] || t('auth.error.generic');
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
        showAuthError(getAuthErrorMessage(error.code));
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
        showAuthError(getAuthErrorMessage(error.code));
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

            // Update user profile doc in Firestore with displayName immediately
            await db.collection('users').doc(cred.user.uid).set({
                displayName: displayName,
                email: cred.user.email || '',
                photoURL: cred.user.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Force app UI to show display name immediately
            showApp(cred.user, '', displayName);
        }
    } catch (error) {
        console.error('Register error:', error);
        showAuthError(getAuthErrorMessage(error.code));
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
        if (typeof showToast === 'function') showToast(t('toast.login_required'), 'danger');
        return;
    }

    // Set input values
    authElements.profileDisplayName.value = authElements.userName.textContent || user.displayName || '';
    authElements.profileEmail.value = user.email || '';

    // Set avatar preview from current active header avatar
    if (authElements.userAvatar.style.display !== 'none' && authElements.userAvatar.src) {
        authElements.profileAvatarPreview.src = authElements.userAvatar.src;
    } else {
        authElements.profileAvatarPreview.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authElements.userName.textContent || 'User')}`;
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

// Compress and resize image using HTML5 Canvas to safely save as Base64 in Firestore
function compressAndResizeImage(file, maxWidth = 200, maxHeight = 200, quality = 0.75) {
    return new Promise((resolve, reject) => {
        // Validate if it is an image
        if (!file.type.startsWith('image/')) {
            reject(new Error(t('toast.image_select_error')));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                // Create off-screen canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Export to Base64 JPEG data URL with compressed quality
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error(t('toast.image_load_error')));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error(t('toast.image_read_error')));
        reader.readAsDataURL(file);
    });
}

// Handle local image file loading & client-side compression
async function handleProfilePicSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show visual feedback or toast that image is processing
    authElements.profilePicError.classList.add('hidden');
    authElements.profilePicError.textContent = '';

    try {
        // Compress image to max 200px width/height and 0.75 quality in real-time!
        const compressedBase64 = await compressAndResizeImage(file, 200, 200, 0.75);

        selectedProfilePicBase64 = compressedBase64;
        authElements.profileAvatarPreview.src = selectedProfilePicBase64;
        authElements.profilePicError.classList.add('hidden');
    } catch (error) {
        console.error('Error compressing image:', error);
        authElements.profilePicError.textContent = error.message || t('toast.image_process_error');
        authElements.profilePicError.classList.remove('hidden');
    }
}

// Reset/Remove avatar back to original Google account photo or default avatar
function handleRemoveAvatarPic() {
    const user = auth.currentUser;
    if (!user) return;

    // Search for google provider photo URL
    const googleProfile = user.providerData.find(p => p.providerId === 'google.com');
    const googlePhotoURL = googleProfile ? googleProfile.photoURL : '';

    // Mark for removal
    selectedProfilePicBase64 = 'REMOVE';

    // Show preview immediately
    if (googlePhotoURL) {
        authElements.profileAvatarPreview.src = googlePhotoURL;
    } else {
        const displayName = authElements.profileDisplayName.value.trim() || user.displayName || user.email || 'User';
        authElements.profileAvatarPreview.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
    }

    authElements.profilePicError.classList.add('hidden');
    if (typeof showToast === 'function') showToast(t('toast.avatar_reset'), 'info');
}

// Save Profile Updates to Firebase and Firestore
async function saveUserProfileData(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newDisplayName = authElements.profileDisplayName.value.trim();
    if (!newDisplayName) {
        if (typeof showToast === 'function') showToast(t('toast.name_required'), 'danger');
        return;
    }

    // Show app loading overlay
    authElements.loadingOverlay.classList.remove('hidden');

    try {
        // 1. Update Firebase Auth Profile (ONLY update displayName, skip base64 photoURL as it exceeds 2KB limit!)
        await user.updateProfile({ displayName: newDisplayName });

        // 2. Fetch current Firestore doc or fallback to provider Google photo URL
        const userDocRef = db.collection('users').doc(user.uid);
        const googleProfile = user.providerData.find(p => p.providerId === 'google.com');
        const googlePhotoURL = googleProfile ? googleProfile.photoURL : '';

        let finalPhotoURL = '';
        if (selectedProfilePicBase64 === 'REMOVE') {
            finalPhotoURL = googlePhotoURL || '';
        } else if (selectedProfilePicBase64) {
            finalPhotoURL = selectedProfilePicBase64;
        } else {
            const doc = await userDocRef.get();
            finalPhotoURL = doc.exists && doc.data().photoURL ? doc.data().photoURL : (user.photoURL || '');
        }

        // 3. Update Cloud Firestore Document (Firestore supports up to 1MB which is perfect for Base64!)
        await userDocRef.set({
            displayName: newDisplayName,
            photoURL: finalPhotoURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 4. Update Current Session UI Header in real-time
        authElements.userName.textContent = newDisplayName;
        if (finalPhotoURL) {
            authElements.userAvatar.src = finalPhotoURL;
            authElements.userAvatar.style.display = 'block';
        } else {
            authElements.userAvatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newDisplayName)}`;
            authElements.userAvatar.style.display = 'block';
        }

        if (typeof showToast === 'function') showToast(t('toast.profile_updated'), 'success');
        closeProfileModal();
    } catch (error) {
        console.error('Error updating profile:', error);
        if (typeof showToast === 'function') showToast(t('toast.profile_error'), 'danger');
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
    authElements.btnConfirmDeleteText.textContent = `${t('delete.waiting')} (${countdown})`;

    // Clear any existing intervals
    if (deleteCountdownInterval) clearInterval(deleteCountdownInterval);

    deleteCountdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            authElements.btnConfirmDeleteText.textContent = `${t('delete.waiting')} (${countdown})`;
        } else {
            clearInterval(deleteCountdownInterval);
            deleteCountdownInterval = null;
            authElements.btnConfirmDeleteText.textContent = t('delete.confirm_btn');
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
        authElements.deleteErrorMessage.textContent = t('delete.error.invalid');
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
        if (typeof showToast === 'function') showToast(t('toast.account_deleted'), 'success');
    } catch (error) {
        console.error('Error deleting account:', error);

        // Handle security sensitive operation recent login requirement
        if (error.code === 'auth/requires-recent-login') {
            authElements.deleteErrorMessage.innerHTML = t('delete.error.relogin');
            authElements.deleteErrorMessage.classList.remove('hidden');
        } else {
            authElements.deleteErrorMessage.textContent = t('delete.error.generic');
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
            showAuthError(t('auth.error.fill_email_password'));
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
            showAuthError(t('auth.error.fill_email_password'));
            return;
        }
        if (password !== confirmPassword) {
            showAuthError(t('auth.error.password_mismatch'));
            return;
        }
        if (password.length < 6) {
            showAuthError(t('auth.error.password_too_short'));
            return;
        }
        registerWithEmail(email, password, name);
    });

    // Logout button
    authElements.btnLogout.addEventListener('click', logout);

    // -------------------------------------------------------------
    // Profile & Account Settings Events
    // -------------------------------------------------------------

    // Profile modal is now opened via dropdown menu in app.js (btn-open-profile)
    // No direct click on userProfileSection to open modal.

    // Close profile settings
    authElements.btnProfileClose.addEventListener('click', closeProfileModal);
    authElements.btnProfileCancel.addEventListener('click', closeProfileModal);
    authElements.profileModalOverlay.addEventListener('click', (e) => {
        if (e.target === authElements.profileModalOverlay) closeProfileModal();
    });

    // Profile pic edit button click simulations
    authElements.profileAvatarPreview.addEventListener('click', () => authElements.profilePicInput.click());
    document.getElementById('btn-upload-avatar').addEventListener('click', () => authElements.profilePicInput.click());

    // Profile pic input changes
    authElements.profilePicInput.addEventListener('change', handleProfilePicSelection);

    // Reset profile avatar to default
    authElements.btnRemoveAvatarPic.addEventListener('click', handleRemoveAvatarPic);

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
