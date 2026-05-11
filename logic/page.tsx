"use client";
import React, { useState } from "react";
import { auth, googleProvider } from "../lib/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "/";
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "/";
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  return (
    <div
      style={
        {
          minHeight: "100vh",
          background: "#0d1117",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        } as React.CSSProperties
      }
    >
      <div
        style={
          {
            background: "#161b22",
            padding: "40px",
            borderRadius: "12px",
            border: "1px solid #21262d",
            width: "360px",
          } as React.CSSProperties
        }
      >
        <h1
          style={
            {
              color: "#00ff88",
              textAlign: "center",
              marginBottom: "24px",
            } as React.CSSProperties
          }
        >
          {isSignUp ? "Create Account" : "Sign In"} — TruthLens
        </h1>
        {error && (
          <p style={{ color: "#ef4444", marginBottom: "12px" }}>{error}</p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={
            {
              width: "100%",
              padding: "10px",
              marginBottom: "12px",
              background: "#0d1117",
              color: "#e2e8f0",
              border: "1px solid #21262d",
              borderRadius: "6px",
              boxSizing: "border-box",
            } as React.CSSProperties
          }
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={
            {
              width: "100%",
              padding: "10px",
              marginBottom: "16px",
              background: "#0d1117",
              color: "#e2e8f0",
              border: "1px solid #21262d",
              borderRadius: "6px",
              boxSizing: "border-box",
            } as React.CSSProperties
          }
        />
        <button
          onClick={handleEmailAuth}
          style={
            {
              width: "100%",
              padding: "12px",
              background: "#00ff88",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "12px",
            } as React.CSSProperties
          }
        >
          {isSignUp ? "Create Account" : "Sign In"}
        </button>
        <button
          onClick={handleGoogle}
          style={
            {
              width: "100%",
              padding: "12px",
              background: "#4285f4",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "16px",
            } as React.CSSProperties
          }
        >
          Continue with Google
        </button>
        <p
          style={
            {
              color: "#94a3b8",
              textAlign: "center",
              cursor: "pointer",
            } as React.CSSProperties
          }
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "No account? Sign Up"}
        </p>
      </div>
    </div>
  );
}
