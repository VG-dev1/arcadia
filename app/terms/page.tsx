"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p style={{ color: "#818cf8", fontSize: "14px", fontWeight: "500", margin: 0, letterSpacing: "0.5px" }}>
            Last Updated: June 15, 2026
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "36px", fontSize: "16px", lineHeight: "1.7", color: "#a3a3a3" }}>
          <p style={{ fontSize: "17px", color: "#e2e8f0" }}>
            Welcome to Arcadia! By creating an account or using our application, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              1. Use of the Service
            </h2>
            <p>
              Arcadia is a visual productivity and spatial planning tool. You agree to use the service only for lawful purposes. You are entirely responsible for maintaining the security of your login credentials and account access.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              2. Age Restrictions
            </h2>
            <p>
              By signing up, you represent and warrant that you are at least 13 years of age. Users under 13 are strictly prohibited from creating an account.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              3. Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to Arcadia at any time, without prior notice, if you abuse our infrastructure, attempt to hack the service, or violate these terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              4. Disclaimer of Warranties ("As-Is")
            </h2>
            <p style={{ marginBottom: "12px" }}>
              Arcadia is provided on an <span style={{ color: "white", fontWeight: "500" }}>"as-is"</span> and <span style={{ color: "white", fontWeight: "500" }}>"as-available"</span> basis. We make no guarantees that the service will be completely uninterrupted, bug-free, or error-free.
            </p>
            <p>
              In no event shall Arcadia or its developer be liable for any data loss, scheduling errors, or damages resulting from the use or inability to use this software.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              5. Changes to Terms
            </h2>
            <p>
              We may modify these terms from time to time. Your continued use of Arcadia after changes are posted constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section style={{ borderTop: "1px solid #1e2638", paddingTop: "32px", marginTop: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "white", marginBottom: "14px" }}>
              6. Contact
            </h2>
            <p>
              For support or inquiries, please contact:{" "}
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