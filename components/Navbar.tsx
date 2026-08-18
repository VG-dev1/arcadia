"use client";

import { UserProfile } from "@/lib/UserProfile";

export function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 15px",
        borderBottom: "1px solid #1a1a1a",
        backgroundColor: "#000",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/icon.png" alt="Arcadia icon" />
      </div>

      <UserProfile />
    </nav>
  );
}