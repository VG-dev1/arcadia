"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function FeaturesViewsPage() {
  const router = useRouter();

  const views = [
    {
      id: "clock-view",
      badge: "01 / ARCADIA'S FAMOUS CLOCK VIEW",
      title: "Clock & arcs view",
      description: "Perfect for those with a feeling of lack of time and for those suffering from time blindness.",
      imgSrc: "/clock-view.png",
      imgAlt: "Clock view preview"
    },
    {
      id: "todo-view",
      badge: "02 / THE CLASSIC TODO LIST",
      title: "Todo list we all know",
      description: "Perfect for those wanting the simplest view, despite us encouraging the use of other views.",
      imgSrc: "/todo-view.png",
      imgAlt: "Todo list preview"
    },
    {
      id: "calendar-view",
      badge: "03 / THE CLASSIC CALENDAR",
      title: "Minimalistic weekly calendar",
      description: "Monitor real-time session countdowns, active momentum, and monthly insights to stay on top of your goals.",
      imgSrc: "/calendar-view.png",
      imgAlt: "Weekly calendar preview"
    }
  ];

  return (
    <div style={{
      backgroundColor: "#0B0F1A",
      color: "white",
      fontFamily: "var(--font-geist-sans), sans-serif",
      overflowX: "hidden"
    }}>
      <style>{`
        .feature-item {
          display: flex;
          align-items: center;
          gap: 60px;
          scroll-margin-top: 100px;
        }

        .feature-item:nth-child(even) {
          flex-direction: row-reverse;
        }

        .feature-image-wrapper {
          flex: 1;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #1e2638;
          background-color: #111420;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .feature-image {
          width: 100%;
          height: auto;
          aspect-ratio: 4 / 3;
          object-fit: fill;
          display: block;
        }

        .feature-text {
          flex: 1;
        }

        @media (max-width: 900px) {
          .feature-item, .feature-item:nth-child(even) {
            flex-direction: column;
            gap: 32px;
          }
        }
      `}</style>

      <section style={{
        minHeight: "50vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px 60px",
        boxSizing: "border-box",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "760px" }}>
          <h1 style={{ 
            fontSize: "clamp(32px, 5.5vw, 68px)", 
            fontWeight: "600", 
            lineHeight: "1.15", 
            margin: "0 0 24px 0", 
            letterSpacing: "-2px" 
          }}>
            So, which task view does suit you the best?
          </h1>

          <p style={{ 
            fontSize: "18px", 
            color: "#a3a3a3", 
            maxWidth: "580px", 
            margin: "0 auto 40px", 
            lineHeight: "1.6" 
          }}>
            Compare different task views to see which one works the best for your workflow.
          </p> 
        </div>
      </section>

      <section style={{
        width: "100%",
        backgroundColor: "#111",
        padding: "100px 20px",
        boxSizing: "border-box",
        borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          display: "flex", 
          flexDirection: "column", 
          gap: "100px" 
        }}>
          {views.map((item) => (
            <div key={item.id} id={item.id} className="feature-item">
              <div className="feature-text">
                <span style={{ 
                  fontSize: "12px", 
                  letterSpacing: "3px", 
                  color: "#818cf8", 
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "12px"
                }}>
                  {item.badge}
                </span>

                <h2 style={{ 
                  fontSize: "clamp(28px, 3vw, 42px)", 
                  fontWeight: "600", 
                  color: "#ffffff", 
                  margin: "0 0 16px 0",
                  letterSpacing: "-1px"
                }}>
                  {item.title}
                </h2>

                <p style={{ 
                  fontSize: "16px", 
                  color: "#a3a3a3", 
                  lineHeight: "1.6", 
                  margin: 0,
                  maxWidth: "480px"
                }}>
                  {item.description}
                </p>
              </div>

              <div className="feature-image-wrapper">
                <img 
                  src={item.imgSrc} 
                  alt={item.imgAlt} 
                  className="feature-image" 
                  loading="lazy" 
                />
              </div>
            </div>
          ))}

          <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "20px", textAlign: "center" }}>
            More coming soon!
          </h2>
        </div>
      </section>

      <section style={{ padding: "120px 0px", textAlign: "center" }}>
        <div style={{ 
          backgroundColor: "#111",
          padding: "80px 40px", 
          width: "100%",
          boxSizing: "border-box"
        }}>
          <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "20px" }}>
            Get started today
          </h2>
          <p style={{ fontSize: "18px", marginBottom: "40px", color: "#a3a3a3" }}>
            Experience your tasks visually and master your daily schedule.
          </p>
          <div data-nosnippet>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: "white", 
                color: "black", 
                border: "none",
                padding: "18px 48px", 
                borderRadius: "6px", 
                fontSize: "16px",
                fontWeight: "600", 
                cursor: "pointer", 
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              GET ARCADIA FREE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}