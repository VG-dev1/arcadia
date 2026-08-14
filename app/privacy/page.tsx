"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div style={{
      backgroundColor: "#0B0F1A",
      color: "white",
      fontFamily: "var(--font-geist-sans), sans-serif",
      minHeight: "100vh",
      padding: "80px 20px"
    }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        <button 
          onClick={() => router.push('/')}
          style={{
            background: "none",
            border: "1px solid #1e2638",
            color: "#a3a3a3",
            padding: "10px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "40px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1e2638";
            e.currentTarget.style.color = "#a3a3a3";
          }}
        >
          ← Back to Arcadia
        </button>

        <header style={{ borderBottom: "1px solid #1e2638", paddingBottom: "24px", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: "600", letterSpacing: "-1px", margin: "0 0 12px 0" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "#818cf8", fontSize: "14px", fontWeight: "500", margin: 0, letterSpacing: "0.5px" }}>
            Last Updated: June 15, 2026
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "36px", fontSize: "16px", lineHeight: "1.7", color: "#a3a3a3" }}>
          <p style={{ fontSize: "17px", color: "#e2e8f0" }}>
            At Arcadia, we take your privacy seriously. This Privacy Policy explains what data we collect, how we use it, and how we protect it. By using Arcadia, you agree to the terms outlined below.
          </p>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We only collect the minimal amount of data necessary to provide you with a secure, working service:
            </p>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>
                <strong style={{ color: "white" }}>Account Data:</strong> When you sign up, we collect your email address, username, and a securely encrypted password.
              </li>
              <li>
                <strong style={{ color: "white" }}>Analytics Data:</strong> We use Google Analytics to collect anonymous information about how visitors interact with our website (e.g., page views, session duration, and bounce rates). This data does not identify you personally.
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              2. How We Use Your Data
            </h2>
            <p style={{ marginBottom: "12px" }}>
              We use the collected information strictly to:
            </p>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Maintain, secure, and operate your Arcadia account.</li>
              <li>Analyze anonymous website traffic to improve the landing page and application experience.</li>
              <li>Send critical system updates or respond to support inquiries.</li>
            </ul>
            <p style={{ marginTop: "16px", color: "#f87171", fontWeight: "500" }}>
              We will never sell your data to third parties or use it for advertising.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              3. Data Storage and Security
            </h2>
            <p>
              Your account data is securely stored using industry-standard database providers and modern encryption paradigms. While we implement strong security measures to protect your data, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              4. Children's Privacy
            </h2>
            <p>
              Arcadia does not knowingly collect or solicit personal information from anyone under the age of 13. If you are under 13, please do not attempt to register for Arcadia or send any personal info about yourself to us. If we discover we have collected info from a child under 13, we will delete that account immediately.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              5. Your Rights
            </h2>
            <p>
              You own your data. You have the right at any time to request a copy of your data or ask us to completely delete your account and all associated data from our systems.
            </p>
          </section>

          <section style={{ borderTop: "1px solid #1e2638", paddingTop: "32px", marginTop: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              6. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or wish to request data deletion, please contact us at:{" "}
              <a 
                href="mailto:vitohackergrgic@gmail.com" 
                style={{ color: "#818cf8", textDecoration: "none", borderBottom: "1px dashed #818cf8" }}
              >
                vitohackergrgic@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}