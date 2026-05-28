/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Detect if Firebase setup is complete
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey !== "");

let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;

if (isFirebaseConfigured) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId || "(default)");
    authInstance = getAuth(appInstance);
  } catch (err) {
    console.error("Firebase services initialization failed:", err);
  }
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance || ({
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Return unsubscribe callback immediately and fire with null user for offline mode
    callback(null);
    return () => {};
  },
  currentUser: null
} as any);

export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;
export { signInWithPopup, signOut };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
          })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Simulated persistence driver to ensure the app works 100% of the time,
// and saves state in localStorage as a bulletproof fallback when Firebase setup is pending.
const STORAGE_PREFIX = "growdaily_rpg_";

export function loadLocalState<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Local storage read failure:", err);
  }
  return defaultValue;
}

export function saveLocalState<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error("Local storage save failure:", err);
  }
}
