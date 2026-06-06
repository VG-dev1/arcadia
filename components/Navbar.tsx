"use client";

import { UserProfile } from "@/lib/UserProfile";

export function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 48px",
        borderBottom: "1px solid #1a1a1a",
        backgroundColor: "#000",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/icon.png" alt="Arcadia icon" />
        <span style={{ fontSize: "22px", textTransform: "uppercase", letterSpacing: "3px", color: "#fff" }}>
          Arcadia
        </span>
      </div>

      <UserProfile />
    </nav>
  );
}