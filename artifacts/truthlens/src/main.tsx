import { createRoot } from "react-dom/client";
import { setBaseUrl, setAuthTokenGetter, setFirebaseConfig, getFirebaseAuth } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

setBaseUrl(import.meta.env.VITE_API_URL || "https://zixo-ai.onrender.com");

setFirebaseConfig({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
});

setAuthTokenGetter(async () => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    return user ? user.getIdToken() : null;
  } catch {
    return null;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
