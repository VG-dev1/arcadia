"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function FeaturesPage() {
  const router = useRouter();

  const features = [
    {
      id: "capture-tasks",
      badge: "",
      title: "Capture tasks",
      description: "Dump your thoughts, brain dumps, and daily responsibilities quickly into one organized queue without friction.",
      imgSrc: "/capture-tasks.png",
      imgAlt: "Capture tasks feature preview",
      link: []
    },
    {
      id: "see-your-day",
      badge: "",
      title: "See your day",
      description: "Transform abstract deadlines into clear spatial blocks around your 24-hour clock wheel, calendar, or pomodoro timer.",
      imgSrc: "/visualize-your-day.png",
      imgAlt: "See your day feature preview",
      link: ["Compare views", "/features/views"]
    },
    {
      id: "track-your-progress",
      badge: "",
      title: "Track your progress",
      description: "Monitor real-time session countdowns, active momentum, and monthly insights to stay on top of your goals.",
      imgSrc: "/track-your-progress.png",
      imgAlt: "Track your progress feature preview",
      link: []
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
          object-fit: cover;
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
            <span style={{ 
              textDecoration: "line-through", 
              textDecorationColor: "#ef4444", 
              textDecorationThickness: "4px",
              color: "#6b7280",
              marginRight: "12px",
              display: "inline-block"
            }}>
              Boring todo lists
            </span>
            <br />
            <span style={{ color: "#ffffff", fontWeight: "700" }}>
              Task visualization
            </span>
          </h1>

          <p style={{ 
            fontSize: "18px", 
            color: "#a3a3a3", 
            maxWidth: "580px", 
            margin: "0 auto 40px", 
            lineHeight: "1.6" 
          }}>
            Capture tasks, see your day, and track your progress.
          </p>

          <div data-nosnippet>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: "white", 
                color: "black", 
                border: "none",
                padding: "9px 15px", 
                borderRadius: "6px", 
                fontSize: "16px",
                fontWeight: "600", 
                cursor: "pointer"
              }}
            >
              Try Arcadia for free
            </button>
          </div>
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
          {features.map((item) => (
            <div key={item.id} id={item.id} className="feature-item">
              <div className="feature-text">
                <span style={{ 
                  fontSize: "12px", 
                  letterSpacing: "3px", 
                  color: "#80ef08", 
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

                {item.link && item.link.length > 0 && (
                  <button style={{
                    backgroundColor: "white", color: "black", border: "none",
                    padding: "9px 15px", borderRadius: "6px", fontSize: "16px",
                    fontWeight: "600", cursor: "pointer", marginTop: "12px"
                  }}
                  onClick={() => router.push(item.link[1])}
                  >
                    {item.link[0]}
                  </button>
                )}
                
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
          <div data-nosnippet>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: "white", 
                color: "black", 
                border: "none",
                padding: "9px 15px", 
                borderRadius: "6px", 
                fontSize: "16px",
                fontWeight: "600", 
                cursor: "pointer",
              }}
            >
              Try Arcadia for free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}