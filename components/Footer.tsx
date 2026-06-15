"use client";

import { usePathname, useRouter } from "next/navigation";

const FOOTER_ROUTES = ["/", "/privacy", "/terms"];

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const shouldShow = pathname && FOOTER_ROUTES.includes(pathname);

  if (!shouldShow) return null;

  return (
    <>
      <style>{`
        .footer-wrapper {
          width: 100%;
          background-color: #000;
          border-top: 1px solid #1e2638;
          color: #a3a3a3;
          font-family: var(--font-geist-sans), sans-serif;
          padding: 60px 20px 30px 20px;
          box-sizing: border-box;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 380px;
        }

        .footer-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-logo-img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .footer-brand-name {
          color: white;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .footer-slogan {
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .footer-links-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links-title {
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .footer-link-btn {
          background: none;
          border: none;
          color: #a3a3a3;
          font-size: 14px;
          padding: 0;
          cursor: pointer;
          text-align: left;
          transition: color 0.2s ease;
          width: fit-content;
        }

        .footer-link-btn:hover {
          color: #818cf8;
        }

        .footer-bottom {
          border-top: 1px solid #111420;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #444;
        }

        @media (max-width: 768px) {
          .footer-top {
            flex-direction: column;
            gap: 40px;
          }
          
          .footer-brand {
            max-width: 100%;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>

      <footer className="footer-wrapper">
        <div className="footer-container">

          <div className="footer-top">

            <div className="footer-brand">
              <div className="footer-logo-row">
                <img src="/icon.png" alt="Arcadia Icon" className="footer-logo-img" />
                <h4 className="footer-brand-name">Arcadia</h4>
              </div>
              <p className="footer-slogan">
                Stop losing track of hours. See your day on a 24-hour circle.
              </p>
            </div>

            <div className="footer-links-column">
              <h5 className="footer-links-title">Legal</h5>
              <button onClick={() => router.push('/privacy')} className="footer-link-btn">
                Privacy Policy
              </button>
              <button onClick={() => router.push('/terms')} className="footer-link-btn">
                Terms of Service
              </button>
            </div>

          </div>

          <div className="footer-bottom">
            <p style={{ margin: 0 }}>© 2026 Arcadia. All rights reserved.</p>
          </div>

        </div>
      </footer>
    </>
  );
}