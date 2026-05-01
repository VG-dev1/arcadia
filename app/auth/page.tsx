"use client";

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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
      
      router.push('/');
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