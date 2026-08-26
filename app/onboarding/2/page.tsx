"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, collection, getDocs, deleteDoc as deleteFirestoreDoc, setDoc } from 'firebase/firestore';

export default function onboardingScreen2() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [selectedViews, setSelectedViews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const views = ["Clock", "Todo", "Insights", "Calendar", "Kanban"];
  const toggleView = (view : string) => {
    setSelectedViews((current) =>
      current.includes(view)
        ? current.filter((item) => item !== view)
        : [...current, view]
    );
  };

  console.log(selectedViews);

  const NAV_ITEMS = [
    {
      label: "Dashboard",
      id: "Clock",
      description: "Clock arc view; perfect for anyone struggling with time blindness.",
      path: "/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 1 A8 8 0 1 1 1 9 A8 8 0 1 1 9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Insights",
      id: "Insights",
      description: "Monitor your monthly progress.",
      path: "/insights",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <polyline
            points="1,14 6,8 10,11 17,3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      label: "Todo List",
      id: "Todo",
      description: "We at Arcadia don't like todo lists, but we still offer them.",
      path: "/todo",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path 
            d="M2.5 5.5L4 7L7.5 3.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <line 
            x1="10" 
            y1="5" 
            x2="16" 
            y2="5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <path 
            d="M2.5 12.5L4 14L7.5 10.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <line 
            x1="10" 
            y1="12" 
            x2="16" 
            y2="12" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Calendar",
      id: "Calendar",
      description: "Table calendar for time blocking + circular calendars.",
      path: "/calendar",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect
            x="2.5"
            y="3.5"
            width="13"
            height="12"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="6"
            y1="2.5"
            x2="6"
            y2="5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="2.5"
            x2="12"
            y2="5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="2.5"
            y1="7"
            x2="15.5"
            y2="7"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="6"
            y1="10"
            x2="6"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="10"
            x2="9"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="10"
            x2="12"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="6"
            y1="13"
            x2="6"
            y2="13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="13"
            x2="9"
            y2="13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Kanban Board",
      id: "Kanban",
      description: "3-column Kanban boards.",
      path: "/kanban",
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect
            x="2.5"
            y="2.5"
            width="13"
            height="13"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="9"
            y1="2.5"
            x2="9"
            y2="15.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="4.5"
            y="4.5"
            width="2.5"
            height="6"
            rx="0.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="11"
            y="4.5"
            width="2.5"
            height="3.5"
            rx="0.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="11"
            y="10"
            width="2.5"
            height="3.5"
            rx="0.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ),
    }
  ];

  const handleUpdate = async (viewsToSave: string[]) => {
    setError('');
    setSaving(true);

    try {
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            pinnedViews: viewsToSave,
          },
          { merge: true }
        );
      }

      router.push('/onboarding/3');
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <style>{`
        .pages-grid {
          display: grid;
          grid-template-columns: auto auto auto;
          padding: 28px;
          gap: 6px;
        }
        .pages-grid div {
          border: 1px solid #1e2638;
          border-radius: 12px;
          padding: 28px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
      <h1 style={{ fontSize: "clamp(32px, 5.5vw, 76px)", textAlign: "center", fontWeight: "600", lineHeight: "1.1", margin: "24px 0 24px 0" }}>
        Which pages would you prefer?
      </h1>

      <div className="pages-grid">
        {NAV_ITEMS.map((item) => (
          <button key={item.id}>
            <div className="nav-item" onClick={() => toggleView(item.id)}>
              {item.icon}
              <span>{item.id}</span>
              <span>{selectedViews.includes(item.id) ? "✓" : ""}</span>
            </div>
          </button>
        ))}
      </div>

      <div>
        {NAV_ITEMS.map((item) => (
          <p key={item.id} style={{ textAlign: "center" }}>{item.id} — {item.description}</p>
        ))}
      </div>

      {error && (
        <p style={{ color: "#ef4444", fontSize: "13px", margin: "-8px 0 20px 0" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "28px" }}>
        <button
          onClick={() => {
            const viewsToSave =
              selectedViews.length === 0 ? views : selectedViews;

            setSelectedViews(viewsToSave);
            handleUpdate(viewsToSave);
          }}
          className="buttonPrimary"
        >
          {selectedViews.length === 0 ? "Not sure yet" : "Pin these"}
        </button>
      </div>
    </div>
  )
}