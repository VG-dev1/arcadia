"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { auth, db } from '@/lib/firebase';
import {
  updatePassword,
  updateEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, getDocs, deleteDoc as deleteFirestoreDoc } from 'firebase/firestore';

// ─── Shared primitives ────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: "28px" }}>
    <label style={{
      display: "block",
      fontSize: "11px",
      letterSpacing: "1.5px",
      color: "#fff",
      marginBottom: "8px",
      textTransform: "uppercase",
    }}>
      {label}
    </label>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={{
      width: "100%",
      backgroundColor: "#1a1a1a",
      border: "1px solid #fff",
      borderRadius: "6px",
      color: "white",
      padding: "10px 12px",
      fontSize: "15px",
      fontFamily: "var(--font-cuprum), sans-serif",
      outline: "none",
      boxSizing: "border-box",
      ...props.style,
    }}
  />
);

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "#111",
        border: "1px solid #fff",
        borderRadius: "12px",
        padding: "36px",
        minWidth: "420px",
        maxWidth: "480px",
        color: "white",
        fontFamily: "var(--font-cuprum), sans-serif",
      }}
    >
      {children}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  // Re-authenticate helper
  const reauth = async (password: string) => {
    if (!user?.email) throw new Error('No authenticated user.');
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  const handleUpdate = async () => {
    setError('');
    if (!username.trim()) { setError('Username cannot be empty.'); return; }
    if (!email.trim()) { setError('Email cannot be empty.'); return; }
    if ((email !== userProfile?.email || newPassword) && !currentPassword) {
      setError('Enter your current password to change email or password.');
      return;
    }

    setSaving(true);
    try {
      if (email !== userProfile?.email || newPassword) {
        await reauth(currentPassword);
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { username: username.trim(), email: email.trim() });
      }

      if (email !== userProfile?.email && user) {
        await updateEmail(user, email.trim());
      }

      if (newPassword) {
        if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); setSaving(false); return; }
        await updatePassword(user!, newPassword);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('wrong-password') || err.message.includes('invalid-credential')) {
          setError('Current password is incorrect.');
        } else if (err.message.includes('email-already-in-use')) {
          setError('That email is already in use.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    if (!deletePassword) { setDeleteError('Enter your password to confirm.'); return; }
    setDeleting(true);
    try {
      await reauth(deletePassword);

      if (user) {
        const tasksRef = collection(db, 'users', user.uid, 'tasks');
        const dateSnaps = await getDocs(tasksRef);
        for (const dateDoc of dateSnaps.docs) {
          const itemsRef = collection(db, 'users', user.uid, 'tasks', dateDoc.id, 'items');
          const itemSnaps = await getDocs(itemsRef);
          for (const item of itemSnaps.docs) {
            await deleteFirestoreDoc(item.ref);
          }
          await deleteFirestoreDoc(dateDoc.ref);
        }
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteUser(user);
      }

      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('wrong-password') || err.message.includes('invalid-credential')) {
          setDeleteError('Password is incorrect.');
        } else {
          setDeleteError(err.message);
        }
      } else {
        setDeleteError('An unexpected error occurred.');
      }
      setDeleting(false);
    }
  };

  const navBtnStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid #fff",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "var(--font-cuprum), sans-serif",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{
      backgroundColor: "#000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-cuprum), sans-serif",
      color: "white",
    }}>

      {/* Top bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 48px",
      }}>
        <button style={navBtnStyle} onClick={() => router.push('/dashboard')}>
          ← Dashboard
        </button>
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "72px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: "480px" }}>

          {/* Heading */}
          <p style={{ fontSize: "11px", letterSpacing: "2.5px", color: "#fff", textTransform: "uppercase", margin: "0 0 12px 0" }}>
            Account
          </p>
          <h1 style={{ fontSize: "40px", fontWeight: "600", margin: "0 0 48px 0", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            Settings
          </h1>

          {/* Fields */}
          <Field label="Username">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              autoComplete="username"
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>

          <div style={{ height: "1px", backgroundColor: "#1a1a1a", margin: "4px 0 32px 0" }} />

          <Field label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
            />
          </Field>

          <Field label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to change email or password"
              autoComplete="current-password"
            />
          </Field>

          {/* Error */}
          {error && (
            <p style={{ color: "#ef4444", fontSize: "13px", margin: "-8px 0 20px 0" }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                background: "none",
                border: "1px solid #3a1a1a",
                color: "#ef4444",
                padding: "10px 18px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "var(--font-cuprum), sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              Delete Account
            </button>

            <button
              onClick={handleUpdate}
              disabled={saving}
              style={{
                background: "white",
                border: "none",
                color: "black",
                padding: "10px 28px",
                borderRadius: "6px",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "var(--font-cuprum), sans-serif",
                letterSpacing: "0.5px",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving…" : "Update"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <Modal onClose={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
            Delete Account
          </h2>
          <p style={{ fontSize: "14px", lineHeight: "1.7", margin: "0 0 8px 0", color: "#fff" }}>
            This will permanently delete your account and all your scheduled tasks across every day. This action cannot be undone.
          </p>
          <p style={{ fontSize: "14px", lineHeight: "1.7", margin: "0 0 28px 0", color: "#fff" }}>
            You will be signed out and redirected to the home page.
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block", fontSize: "11px", letterSpacing: "1.5px",
              color: "#fff", marginBottom: "8px", textTransform: "uppercase",
            }}>
              Confirm your password
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
            />
          </div>

          {deleteError && (
            <p style={{ color: "#ef4444", fontSize: "13px", margin: "-4px 0 16px 0" }}>
              {deleteError}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
              style={{
                background: "none", border: "1px solid #fff",
                color: "#fff", padding: "10px 18px",
                borderRadius: "6px", cursor: "pointer",
                fontSize: "13px", fontFamily: "var(--font-cuprum), sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              style={{
                background: "#ef4444", border: "none",
                color: "white", padding: "10px 22px",
                borderRadius: "6px", cursor: deleting ? "not-allowed" : "pointer",
                fontSize: "13px", fontWeight: "600",
                fontFamily: "var(--font-cuprum), sans-serif",
                letterSpacing: "0.5px",
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
