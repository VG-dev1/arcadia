"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [codeValid, setCodeValid] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset link. Please request a new one.');
      setVerifying(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then(() => { setCodeValid(true); setVerifying(false); })
      .catch(() => {
        setError('This reset link is invalid or has expired. Please request a new one.');
        setVerifying(false);
      });
  }, [oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode!, password);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/expired-action-code') {
        setError('This reset link has expired. Please request a new one.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('This reset link is invalid. Please request a new one.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: '#111',
    border: '1px solid #fff',
    color: '#fff',
    padding: '12px',
    borderRadius: '6px',
    fontFamily: 'var(--font-cuprum), sans-serif',
    opacity: loading ? 0.5 : 1,
    cursor: loading ? 'wait' : 'text',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{
      backgroundColor: '#000', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: 'white',
      fontFamily: 'var(--font-cuprum), sans-serif',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
        <h1 style={{ letterSpacing: '4px', textAlign: 'center', margin: '0 0 20px 0', fontSize: '20px' }}>
          RESET PASSWORD
        </h1>

        {verifying ? (
          <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '13px', letterSpacing: '1px' }}>
            VERIFYING LINK...
          </p>
        ) : success ? (
          <>
            <p style={{
              textAlign: 'center', fontSize: '14px', lineHeight: '1.7',
              border: '1px solid #fff', borderRadius: '6px', padding: '16px',
            }}>
              Your password has been reset successfully.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: '#fff', color: '#000', padding: '12px',
                fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px',
                border: 'none', fontFamily: 'var(--font-cuprum), sans-serif',
                fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase',
              }}
            >
              BACK TO DASHBOARD
            </button>
          </>
        ) : !codeValid ? (
          <>
            <div style={{
              background: '#3a1a1a', border: '1px solid #ef4444',
              color: '#fca5a5', padding: '12px', borderRadius: '6px',
              fontSize: '12px', textAlign: 'center',
            }}>
              {error}
            </div>
            <p
              onClick={() => router.push('/auth')}
              style={{
                fontSize: '12px', textAlign: 'center', cursor: 'pointer',
                opacity: 0.6, margin: 0, userSelect: 'none',
              }}
            >
              BACK TO LOGIN
            </p>
          </>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{
                background: '#3a1a1a', border: '1px solid #ef4444',
                color: '#fca5a5', padding: '12px', borderRadius: '6px',
                fontSize: '12px', textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <input
              type="password"
              placeholder="NEW PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="CONFIRM PASSWORD"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#fff', color: '#000', padding: '12px',
                fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer',
                borderRadius: '6px', border: 'none',
                fontFamily: 'var(--font-cuprum), sans-serif',
                fontSize: '13px', letterSpacing: '1px',
                opacity: loading ? 0.6 : 1, textTransform: 'uppercase',
              }}
            >
              {loading ? 'RESETTING...' : 'RESET'}
            </button>

            <p
              onClick={() => router.push('/auth')}
              style={{
                fontSize: '12px', textAlign: 'center', cursor: 'pointer',
                opacity: 0.6, margin: 0, userSelect: 'none',
              }}
            >
              BACK TO LOGIN
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}