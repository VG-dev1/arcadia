"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function onboardingScreen1() {
  const router = useRouter();
  return (
    <div>
      <h1 style={{ fontSize: "clamp(32px, 5.5vw, 76px)", textAlign: "center", fontWeight: "600", lineHeight: "1.1", margin: "24px 0 24px 0" }}>
        Welcome to Arcadia!
      </h1>


      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <p style={{ fontSize: "28px", fontWeight: "600", color: "#fff", margin: 0 }}>
          Start your journey of visualising your time.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "28px" }}>
          <img src="/clock-view.png" alt="Clock view"></img>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "30px" }}>
          <div style={{ border: "1px solid #1e2638", borderRadius: "12px", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                <span>✕</span>
              </div>
              <p style={{ fontSize: "16px", margin: 0 }}>Flat todo lists</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                <span>✓</span>
              </div>
              <p style={{ fontSize: "16px", margin: 0 }}>Time visualisation</p>
            </div>
          </div>

          <div style={{ border: "1px solid #1e2638", borderRadius: "12px", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                <span>✕</span>
              </div>
              <p style={{ fontSize: "16px", margin: 0 }}>Multiple task-based apps</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                <span>✓</span>
              </div>
              <p style={{ fontSize: "16px", margin: 0 }}>Only one</p>
            </div>
          </div>

          <div style={{ border: "1px solid #1e2638", borderRadius: "12px", padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                <span>✕</span>
              </div>
              <p style={{ fontSize: "16px", margin: 0 }}>Overwhelming design</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                <span>✓</span>
              </div>
              <p style={{ fontSize: "16px", margin: 0 }}>Calm and minimalistic design</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "28px" }}>
        <button onClick={() => router.push('/onboarding/2')} className="button buttonPrimary">Sounds good!</button>
      </div>
    </div>
  )
}