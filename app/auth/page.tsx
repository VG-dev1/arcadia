"use client";

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (!isLogin && !username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await setDoc(doc(db, 'users', userId), {
          email: email,
          username: username.trim(),
          tasks: {},
          createdAt: new Date(),
        });
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      let errorMessage = err.message;

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please register first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered. Please login.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      setError(errorMessage);
    }
    
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const { getDoc, doc: fsDoc } = await import('firebase/firestore');
      const userDocRef = fsDoc(db, 'users', user.uid);
      const existing = await getDoc(userDocRef);
      if (!existing.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          tasks: {},
          createdAt: new Date(),
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      backgroundColor: '#000', height: '100vh', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', color: 'white',
      fontFamily: 'var(--font-cuprum), sans-serif' 
    }}>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
        <h1 style={{ letterSpacing: '4px', textAlign: 'center', margin: '0 0 20px 0' }}>LOG IN TO ARCADIA</h1>
        
        {error && (
          <div style={{
            background: '#3a1a1a',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <input 
          type="email" 
          placeholder="EMAIL" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          style={{ 
            background: '#111', 
            border: '1px solid #fff', 
            color: '#fff', 
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-cuprum), sans-serif',
            opacity: loading ? 0.5 : 1,
            cursor: loading ? 'wait' : 'text'
          }}
        />

        {!isLogin && (
          <input 
            type="text" 
            placeholder="USERNAME" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            style={{ 
              background: '#111', 
              border: '1px solid #fff', 
              color: '#fff', 
              padding: '12px',
              borderRadius: '6px',
              fontFamily: 'var(--font-cuprum), sans-serif',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'wait' : 'text'
            }}
          />
        )}
        
        <input 
          type="password" 
          placeholder="PASSWORD" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={{ 
            background: '#111', 
            border: '1px solid #fff', 
            color: '#fff', 
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-cuprum), sans-serif',
            opacity: loading ? 0.5 : 1,
            cursor: loading ? 'wait' : 'text'
          }}
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            background: '#fff', 
            color: '#000', 
            padding: '12px', 
            fontWeight: 'bold', 
            cursor: loading ? 'wait' : 'pointer',
            borderRadius: '6px',
            border: 'none',
            fontFamily: 'var(--font-cuprum), sans-serif',
            fontSize: '13px',
            letterSpacing: '1px',
            opacity: loading ? 0.6 : 1,
            textTransform: 'uppercase'
          }}
        >
          {loading ? 'LOADING...' : (isLogin ? 'LOGIN' : 'REGISTER')}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#2a2a2a' }} />
          <span style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#fff' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#2a2a2a' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid #fff',
            color: '#fff',
            padding: '12px',
            borderRadius: '6px',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'var(--font-cuprum), sans-serif',
            fontSize: '13px',
            letterSpacing: '1px',
            opacity: loading ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            textTransform: 'uppercase',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z"/>
          </svg>
          Continue with Google
        </button>

        <p 
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setUsername('');
          }} 
          style={{ 
            fontSize: '12px', 
            textAlign: 'center', 
            cursor: 'pointer', 
            opacity: 0.6,
            margin: 0,
            userSelect: 'none'
          }}
        >
          {isLogin ? "DON'T HAVE AN ACCOUNT? REGISTER" : "HAVE AN ACCOUNT? LOGIN"}
        </p>
      </form>
    </div>
  );
}