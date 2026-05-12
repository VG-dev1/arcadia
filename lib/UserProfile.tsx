"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export const UserProfile: React.FC = () => {
  const { userProfile, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      alert('Error logging out: ' + (error as any).message);
    }
  };

  if (loading || !userProfile) {
    return null;
  }

  const initials = userProfile.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '0',
          fontFamily: 'var(--font-cuprum), sans-serif',
        }}
      >
        {/* Initials Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '12px',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Username */}
        <span style={{ fontSize: '13px', letterSpacing: '0.5px' }}>
          {userProfile.username}
        </span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: '#111',
            border: '1px solid #fff',
            borderRadius: '6px',
            overflow: 'hidden',
            minWidth: '160px',
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => { setShowDropdown(false); router.push('/settings'); }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid #1a1a1a',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--font-cuprum), sans-serif',
              fontSize: '13px',
              letterSpacing: '0.5px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            SETTINGS
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              color: '#fff',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--font-cuprum), sans-serif',
              fontSize: '13px',
              letterSpacing: '0.5px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            LOGOUT
          </button>
        </div>
      )}
    </div>
  );
};
