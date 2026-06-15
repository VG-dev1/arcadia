"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChecklistItem {
  id: string;
  label: string;
  current: number;
  total: number;
  description: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { 
    id: 'create-task', 
    label: 'Create a task', 
    current: 0, 
    total: 5, 
    description: 'Go to the Dashboard page, click "Add task", customize the settings and click "Save"' 
  },
  { 
    id: 'add-category', 
    label: 'Add a custom category', 
    current: 0, 
    total: 1, 
    description: 'While adding/editing a task, click the "Category" dropdown, select "Manage Categories", add your category and click "Save"' 
  },
  { 
    id: 'focus-session', 
    label: 'Complete a focus session', 
    current: 0, 
    total: 3, 
    description: 'Click on a pre-existing task on a clock and click the "Focus" button' 
  },
];

export default function Checklist() {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  
  const [isOpen, setIsOpen] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userProfile) {
      const profileData = userProfile as any;
      if (profileData.checklist && Array.isArray(profileData.checklist)) {
        const profileItemsMap = new Map(profileData.checklist.map((item: any) => [item.id, item]));
        
        const mergedItems = DEFAULT_CHECKLIST.map(defaultItem => {
          const profileItem = profileItemsMap.get(defaultItem.id) as any;
          return {
            ...defaultItem,
            current: profileItem ? profileItem.current : defaultItem.current,
            total: profileItem ? profileItem.total : defaultItem.total,
          };
        });
        
        setItems(mergedItems);
      } else if (user) {
        setItems(DEFAULT_CHECKLIST);
        initializeChecklistInFirebase();
      }
    }
  }, [userProfile, user]);

  const initializeChecklistInFirebase = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { checklist: DEFAULT_CHECKLIST }, { merge: true });
    } catch (error) {
      console.error(error);
    }
  };

  const updateProgress = async (itemId: string, incrementBy: number = 1) => {
    if (saving || !user) return;

    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const nextCount = Math.min(item.current + incrementBy, item.total);
        return { ...item, current: nextCount };
      }
      return item;
    });

    setItems(updatedItems);
    setSaving(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { checklist: updatedItems });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !pathname) return null;
  
  const allowedRoutes = ['/dashboard', '/focus', '/insights'];
  if (!allowedRoutes.includes(pathname) || !user) return null;

  const completedCount = items.filter(item => item.current === item.total).length;
  const totalItems = items.length;
  const overallPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        fontFamily: 'var(--font-geist-sans), sans-serif',
        color: '#d4d4d8'
      }}
    >
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            bottom: '64px',
            right: 0,
            width: '340px',
            borderRadius: '16px',
            border: '1px solid #27272a',
            backgroundColor: '#09090b',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #27272a',
              paddingBottom: '12px'
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, fontSize: '18px', color: '#f4f4f5', margin: 0 }}>Quickstart</h3>
              <p style={{ fontSize: '12px', color: '#71717a', margin: '4px 0 0 0' }}>Complete these to master your workflow</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#71717a',
                fontSize: '14px'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ margin: '16px 0' }}>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 600,
                color: '#a1a1aa',
                marginBottom: '4px'
              }}
            >
              <span>Progress</span>
              <span>{completedCount}/{totalItems} Done ({overallPercentage}%)</span>
            </div>
            <div style={{ height: '8px', width: '100%', backgroundColor: '#27272a', borderRadius: '9999px', overflow: 'hidden' }}>
              <div 
                style={{
                  height: '100%',
                  backgroundColor: '#818cf8',
                  transition: 'width 0.3s ease',
                  width: `${overallPercentage}%`
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {items.map((item) => {
              const isCompleted = item.current === item.total;
              return (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '12px',
                    cursor: isCompleted ? 'default' : 'pointer',
                    backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                  }}
                  onClick={() => !isCompleted && updateProgress(item.id)}
                >
                  <div style={{ marginTop: '2px', display: 'flex', height: '20px', width: '20px', flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
                    {isCompleted ? (
                      <svg style={{ height: '20px', width: '20px', color: '#818cf8' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div style={{ height: '16px', width: '16px', borderRadius: '50%', border: '2px solid #52525b' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p 
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        margin: 0,
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? '#52525b' : '#e4e4e7'
                      }}
                    >
                      {item.label}
                    </p>
                    
                    {item.description && (
                      <p 
                        style={{ 
                          fontSize: '12px', 
                          color: '#71717a', 
                          margin: '4px 0 0 0',
                          lineHeight: '1.4',
                          textDecoration: isCompleted ? 'line-through' : 'none'
                        }}
                      >
                        {item.description}
                      </p>
                    )}

                    {!isCompleted && item.total > 1 && (
                      <p style={{ fontSize: '11px', color: '#52525b', margin: '6px 0 0 0', fontWeight: 600 }}>
                        Progress: {item.current}/{item.total}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          height: '48px',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '9999px',
          backgroundColor: '#f4f4f5',
          color: '#09090b',
          padding: '0 16px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '14px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
          fontFamily: 'var(--font-geist-sans), sans-serif'
        }}
      >
        <svg style={{ height: '20px', width: '20px' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span>Setup Guide</span>
        {completedCount < totalItems && (
          <span 
            style={{
              display: 'flex',
              height: '20px',
              width: '20px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#818cf8',
              fontSize: '10px',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            {totalItems - completedCount}
          </span>
        )}
      </button>
    </div>
  );
}