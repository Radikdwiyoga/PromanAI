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

export const loginWithFirebase = async (email: string, password: string): Promise<{ user: FirebaseUser; userProfile: User }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;
    
    // Fetch profile from Firestore
    const profile = await getUserProfileFromDb(fbUser.uid);

    if (!profile) {
      // Akun ada di Firebase Auth tapi dokumen /users/{uid}-nya tidak ada.
      //
      // Ini kondisi user yang sudah DIHAPUS dari panel Admin: dokumen Firestore
      //-nya dihapus, tapi akun Auth-nya masih hidup. Sebelumnya blok ini
      // membuat ulang profil otomatis dengan status 'active', sehingga user
      // yang sudah dihapus bisa langsung masuk kembali setiap kali mencoba.
      //
      // Sekarang akses ditolak, dan akunnya di-sign-out supaya sesi di browser
      // tidak tertinggal.
      await signOut(auth);
      const removedError: any = new Error(
        'Akun ini tidak lagi aktif. Silakan hubungi Super Admin.'
      );
      removedError.code = 'auth/account-removed';
      throw removedError;
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
    // Tidak ada lagi fallback "buat akun otomatis dengan password bebas".
    // Seluruh user sudah dimigrasikan ke Firebase Auth, dan fallback tersebut
    // sebelumnyaanyone bisa masuk sebagai user mana saja cukup mengetik
    // 123456 atau admin123.
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
    // Password TIDAK disimpan di Firestore. Kredensial milik Firebase Auth.
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
 * Membuat akun Firebase Auth untuk user lain TANPA mengubah sesi yang sedang
 * berjalan.
 *
 * Kenapa tidak pakai `createUserWithEmailAndPassword` dari SDK: fungsi itu
 * sekaligus MEMASUKKAN browser ke akun yang baru dibuat. Akibatnya Super Admin
 * yang sedang menambah anggota baru langsung ter-logout dari sesinya, dan
 * aplikasi tidak bisa melanjutkan.
 *
 * Identity Platform REST API dipanggil langsung sebagai gantinya. Endpoint-nya
 * sama persis dengan yang dipakai SDK di belakang layar, tapi tidak menyentuh
 * state auth di client.
 *
 * @returns UID dari Firebase Auth, dipakai sebagai document ID di /users.
 * @throws dengan `code` yang bisa dibaca pemanggil bila email sudah terpakai.
 */
export const createAuthAccount = async (email: string, password: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    const err: any = new Error('VITE_FIREBASE_API_KEY belum dikonfigurasi.');
    err.code = 'auth/missing-api-key';
    throw err;
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        password,
        returnSecureToken: false,
      }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const raw = data?.error?.message ?? '';
    const err: any = new Error('Gagal membuat akun autentikasi.');
    if (raw.includes('EMAIL_EXISTS')) {
      err.code = 'auth/email-already-in-use';
      err.message = 'Email tersebut sudah punya akun. Gunakan fitur edit, bukan tambah baru.';
    } else if (raw.includes('WEAK_PASSWORD')) {
      err.code = 'auth/weak-password';
      err.message = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
    } else if (raw.includes('INVALID_EMAIL')) {
      err.code = 'auth/invalid-email';
      err.message = 'Format email tidak valid.';
    } else if (raw.includes('OPERATION_NOT_ALLOWED') || raw.includes('BLOCKING_FUNCTION')) {
      err.code = 'auth/operation-not-allowed';
      err.message = 'Pendaftaran email/password dinonaktifkan di Firebase Console.';
    } else {
      err.message = `Gagal membuat akun autentikasi (${res.status}).`;
    }
    throw err;
  }

  return data.localId as string;
};

/**
 * 1. Kirim Email Reset Password via Firebase Auth
 */
export const sendPasswordResetLink = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim());
};

/**
 * 2. Ganti Password Pengguna yang Sedang Login
 *
 * Password hanya hidup di Firebase Auth. Tidak ada lagi penulisan ke Firestore:
 * kolom `password` dihapus karena bisa dibaca siapa pun yang punya akses baca.
 */
export const changeUserPassword = async (
  userId: string,
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  if (!auth.currentUser || !auth.currentUser.email) {
    throw new Error('Sesi tidak aktif. Silakan login ulang sebelum mengganti password.');
  }

  try {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  } catch (e: any) {
    // Password lama salah akan sampai ke sini. Jangan ditelan diam-diam,
    // karena user akan mengira passwordnya sudah diganti.
    if (e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential') {
      throw new Error('Password lama salah. Silakan periksa kembali.');
    }
    if (e?.code === 'auth/weak-password') {
      throw new Error('Password baru terlalu lemah. Gunakan minimal 6 karakter.');
    }
    if (e?.code === 'auth/requires-recent-login') {
      throw new Error('Sesi terlalu lama. Silakan logout lalu login ulang.');
    }
    throw new Error('Gagal mengganti password. Silakan coba lagi.');
  }
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
