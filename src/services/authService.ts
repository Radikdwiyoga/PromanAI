import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';

export const loginWithFirebase = async (email: string, password: string): Promise<{ user: FirebaseUser; userProfile: User }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;
    
    // Fetch profile from Firestore
    let profile = await getUserProfileFromDb(fbUser.uid);
    if (!profile) {
      // Find matching template in INITIAL_USERS or create default
      const template = INITIAL_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      profile = {
        id: fbUser.uid,
        name: template?.name || fbUser.displayName || email.split('@')[0],
        email: fbUser.email || email,
        password: password,
        avatar: template?.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        role: template?.role || 'Team Member',
        department: template?.department || 'Technology',
        capacityHours: template?.capacityHours || 40,
        allocatedHours: template?.allocatedHours || 0,
        personaType: template?.personaType || 'Member',
        status: template?.status || 'active',
      };
      await saveUserProfileToDb(profile);
    }

    // Check Account Verification Status
    if (profile.status === 'pending') {
      await signOut(auth);
      const pendingError: any = new Error('Akun Anda telah terdaftar, namun sedang menunggu verifikasi & persetujuan dari Super Admin.');
      pendingError.code = 'auth/pending-approval';
      throw pendingError;
    }

    if (profile.status === 'rejected') {
      await signOut(auth);
      const rejectError: any = new Error('Pendaftaran akun Anda ditolak oleh Super Admin.');
      rejectError.code = 'auth/account-rejected';
      throw rejectError;
    }

    return { user: fbUser, userProfile: profile };
  } catch (error: any) {
    if (error.code === 'auth/pending-approval' || error.code === 'auth/account-rejected') {
      throw error;
    }

    // If user not found in auth, try matching initial demo seed
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      const template = INITIAL_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (template) {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          const newFbUser = newCredential.user;
          const newProfile: User = {
            ...template,
            id: newFbUser.uid,
            password: password,
            status: template.status || 'active',
          };
          await saveUserProfileToDb(newProfile);
          return { user: newFbUser, userProfile: newProfile };
        } catch (regError) {
          throw regError;
        }
      }
    }
    throw error;
  }
};

export const registerWithFirebase = async (data: {
  name: string;
  email: string;
  password: string;
  department: User['department'];
  role?: string;
}): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
  const fbUser = userCredential.user;

  const newProfile: User = {
    id: fbUser.uid,
    name: data.name.trim(),
    email: data.email.trim(),
    password: data.password,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    role: data.role?.trim() || `${data.department} Specialist`,
    department: data.department,
    capacityHours: 40,
    allocatedHours: 0,
    personaType: 'Member',
    status: 'pending',
    registeredAt: new Date().toISOString(),
  };

  await saveUserProfileToDb(newProfile);
  // Sign out immediately so user waits for admin approval
  await signOut(auth);

  return newProfile;
};

export const logoutFromFirebase = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * 1. Kirim Email Reset Password via Firebase Auth
 */
export const sendPasswordResetLink = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim());
};

/**
 * 2. Ganti Password Pengguna yang Sedang Login
 */
export const changeUserPassword = async (
  userId: string,
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  // Jika user aktif di Firebase Auth, re-authenticate dan update password
  if (auth.currentUser && auth.currentUser.email) {
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
    } catch (e: any) {
      console.warn('Firebase reauth/updatePassword error:', e);
      // Jika credential invalid di auth tapi ada di local state, lanjutkan update database
    }
  }

  // Update password di Firestore document
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { password: newPassword });
  } catch (e) {
    console.warn('Firestore user password update fallback:', e);
  }
};

/**
 * 3. Reset Password Langsung (untuk kebutuhan Lupa Password mandiri/demo)
 */
export const resetUserPasswordDirectly = async (
  userId: string,
  newPassword: string
): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, { password: newPassword });
};

export const getUserProfileFromDb = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as User;
    }
    return null;
  } catch (e) {
    console.error('Error fetching user profile:', e);
    return null;
  }
};

export const saveUserProfileToDb = async (profile: User): Promise<void> => {
  try {
    const docRef = doc(db, 'users', profile.id);
    await setDoc(docRef, profile, { merge: true });
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
