import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

let _auth: Auth | null = null;

export function setFirebaseConfig(config: FirebaseConfig): void {
  if (!config.apiKey || !config.projectId || !config.appId) {
    return;
  }
  let app: FirebaseApp;
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  _auth = getAuth(app);
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    throw new Error(
      "Firebase is not configured. Call setFirebaseConfig() before using auth.",
    );
  }
  return _auth;
}
