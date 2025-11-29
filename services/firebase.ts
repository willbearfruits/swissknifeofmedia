import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

if (hasConfig) {
  app = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(app);
}

export const isFirebaseEnabled = !!firebaseAuth;

export const onAuthChange = (cb: (user: FirebaseUser | null) => void) => {
  if (!firebaseAuth) return () => {};
  return onAuthStateChanged(firebaseAuth, cb);
};
export const loginWithEmail = (email: string, password: string) => {
  if (!firebaseAuth) return Promise.reject(new Error('Firebase auth not configured'));
  return signInWithEmailAndPassword(firebaseAuth, email, password);
};
export const registerWithEmail = (email: string, password: string) => {
  if (!firebaseAuth) return Promise.reject(new Error('Firebase auth not configured'));
  return createUserWithEmailAndPassword(firebaseAuth, email, password);
};
export const logout = () => {
  if (!firebaseAuth) return Promise.resolve();
  return signOut(firebaseAuth);
};
