"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const SIDEBAR_ROUTES = ["/dashboard", "/insights"];

const NAV_ITEMS = [
  {
    label: "Dashboard",
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
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const shouldShow =
    pathname &&
    SIDEBAR_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    );

  const navigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <style>{`
        .sidebar-desktop {
          display: flex;
          flex-direction: column;
          width: 220px;
          min-height: 100%;
          background-color: #000;
          border-right: 1px solid #1a1a1a;
          padding: 32px 0;
          flex-shrink: 0;
        }

        .sidebar-hamburger {
          display: none;
        }

        .sidebar-overlay {
          display: none;
        }

        .sidebar-drawer {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none;
          }

          .sidebar-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 100;
            width: 48px;
            height: 48px;
            background: #111;
            border: 1px solid #2a2a2a;
            border-radius: 12px;
            cursor: pointer;
            color: #fff;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 110;
            opacity: 0;
            pointer-events: none;
          }

          .sidebar-overlay.open {
            opacity: 1;
            pointer-events: all;
          }

          .sidebar-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 240px;
            background: #000;
            border-right: 1px solid #1a1a1a;
            z-index: 120;
            padding: 32px 0;
            transform: translateX(-100%);
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.5, 1);
            }

          .sidebar-drawer.open {
            transform: translateX(0);
          }
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          margin: 2px 12px;
          border-radius: 8px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 14px;
          width: calc(100% - 24px);
        }

        .sidebar-nav-item.active {
          background: #111;
          color: #fff;
        }

        .sidebar-active-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff;
          margin-left: auto;
          opacity: 0;
        }

        .sidebar-nav-item.active .sidebar-active-dot {
          opacity: 1;
        }
      `}</style>

      {shouldShow && (
        <>
          <aside className="sidebar-desktop">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                className={`sidebar-nav-item${
                  pathname === item.path ? " active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.label}
                <span className="sidebar-active-dot" />
              </button>
            ))}
          </aside>

          <button
            className="sidebar-hamburger"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
          >
            ☰
          </button>

          <div
            className={`sidebar-overlay${isOpen ? " open" : ""}`}
            onClick={() => setIsOpen(false)}
          />

          <aside className={`sidebar-drawer${isOpen ? " open" : ""}`}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                className={`sidebar-nav-item${
                  pathname === item.path ? " active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                {item.label}
                <span className="sidebar-active-dot" />
              </button>
            ))}
          </aside>
        </>
      )}
    </>
  );
}