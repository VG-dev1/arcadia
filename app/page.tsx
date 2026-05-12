"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const LandingPage = () => {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);

  const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      setIsMounted(true);
    }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const { user, loading } = useAuth();

  useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

  return (
    <div style={{
      backgroundColor: "#000",
      color: "white",
      fontFamily: "var(--font-cuprum), sans-serif",
      overflowX: "hidden"
    }}>
      {/* HERO SECTION */}
      <section style={{
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          border: "2px solid rgba(255, 255, 255, 0.05)",
          pointerEvents: "none",
          zIndex: 0
        }}>
          <div style={{
            position: "absolute",
            top: "-5px",
            left: "50%",
            width: "120px",
            height: "10px",
            backgroundColor: "#818cf8",
            borderRadius: "10px",
            boxShadow: "0 0 20px #818cf8"
          }} />
        </div>

        <div style={{ zIndex: 1 }}>
          <p style={{ letterSpacing: "4px", color: "#a3a3a3", fontSize: "14px", textTransform: "uppercase", marginBottom: "20px" }}>
            Visual Time Management
          </p>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 90px)", fontWeight: "600", lineHeight: "1", margin: "0 0 30px 0", letterSpacing: "-2px" }}>
            Own Your <span style={{ color: "#818cf8" }}>Day</span>,<br />Arc by Arc.
          </h1>
          <p style={{ fontSize: "18px", color: "#a3a3a3", maxWidth: "600px", margin: "0 auto 40px auto", lineHeight: "1.6" }}>
            Ditch the list. Visualize your schedule on an intuitive clock face that helps you see exactly where your time goes.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              backgroundColor: "white", color: "black", border: "none",
              padding: "18px 48px", borderRadius: "6px", fontSize: "16px",
              fontWeight: "600", cursor: "pointer"
            }}
          >
            GET STARTED
          </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: "100px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", marginBottom: "60px" }}>Core Features</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
            {[
                { 
                title: "Visual Intuition", 
                desc: "View your day as a continuous 24-hour cycle. Arcs represent tasks, giving you an immediate sense of available space.",
                img: "/clock.png" 
                },
                { 
                title: "Day Overview", 
                desc: "Take a look at the summary of your daily tasks and dive into analysis.",
                img: "/daily-summary.png" 
                },
                { 
                title: "Focus Tracking", 
                desc: "A dedicated mode that highlights your current objective on the clock, keeping you grounded in the present moment.",
                img: "/focus-mode.png" 
                }
            ].map((f, i) => (
                <div key={i} style={{ 
                padding: "40px", 
                backgroundColor: "#111", 
                borderRadius: "16px", 
                border: "1px solid #222",
                display: "flex",
                flexDirection: "column"
                }}>
                <img 
                    src={f.img} 
                    alt={f.title} 
                    style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover", 
                    borderRadius: "8px", 
                    marginBottom: "24px",
                    border: "1px solid #333" 
                    }} 
                />
                
                <div style={{ width: "40px", height: "4px", backgroundColor: "#818cf8", marginBottom: "20px" }} />
                <h3 style={{ fontSize: "22px", marginBottom: "15px" }}>{f.title}</h3>
                <p style={{ color: "#a3a3a3", lineHeight: "1.6" }}>{f.desc}</p>
                </div>
            ))}
        </div>
      </section>
      
      {/* REVIEWS SECTION */}
      <section style={{ 
        padding: "80px 0", 
        backgroundColor: "#000", 
        overflow: "hidden", 
        width: "100%" 
        }}>
        <h2 style={{ 
            textAlign: "center", 
            fontSize: "12px", 
            letterSpacing: "3px", 
            textTransform: "uppercase", 
            marginBottom: "40px",
            color: "#fff"
        }}>
            Trusted by high-achievers
        </h2>

        <style>{`
            @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-350px * 5)); }
            }
            .scroll-container {
            display: flex;
            width: calc(350px * 10);
            animation: scroll 30s linear infinite;
            }
            .scroll-container:hover {
            animation-play-state: paused;
            }
        `}</style>

        <div className="scroll-container">
            {[
            { name: "Alex R.", review: "The 24-hour visual is a game changer for my ADHD. I finally see 'time' instead of just numbers." },
            { name: "Sarah M.", review: "Cleanest UI I've ever used. The focus mode helps me stay in the flow for hours." },
            { name: "Jordan K.", review: "Love how it syncs across my devices." },
            { name: "Elena V.", review: "The arc visualization is so intuitive. It's the first time a calendar actually made sense." },
            { name: "Marcus T.", review: "I've tried every planner app out there. This is the only one I've stuck with for over a month." }
            ].concat([
            { name: "Alex R.", review: "The 24-hour visual is a game changer for my ADHD. I finally see 'time' instead of just numbers." },
            { name: "Sarah M.", review: "Cleanest UI I've ever used. The focus mode helps me stay in the flow for hours." },
            { name: "Jordan K.", review: "Vercel + Firebase makes this so snappy. Love how it syncs across my devices." },
            { name: "Elena V.", review: "The arc visualization is so intuitive. It's the first time a calendar actually made sense." },
            { name: "Marcus T.", review: "I've tried every planner app out there. This is the only one I've stuck with for over a month." }
            ]).map((r, i) => (
            <div key={i} style={{
                width: "320px",
                margin: "0 15px",
                padding: "30px",
                backgroundColor: "#111",
                borderRadius: "12px",
                border: "1px solid #222",
                flexShrink: 0
            }}>
                <div style={{ color: "#eab308", marginBottom: "15px", fontSize: "14px" }}>
                ★★★★★
                </div>
                <p style={{ color: "#fff", fontSize: "15px", lineHeight: "1.6", marginBottom: "20px", minHeight: "80px" }}>
                "{r.review}"
                </p>
                <p style={{ color: "#818cf8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
                — {r.name}
                </p>
            </div>
            ))}
        </div>
    </section>

      {/* FAQ SECTION */}
      <section style={{ padding: "100px 20px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "40px", textAlign: "left" }}>FAQ</h2>
        {[
          { 
            q: "How does the clock interface work?", 
            a: "The clock is an SVG-based 24-hour visualization. Each task you create is rendered as a colored arc. The length of the arc corresponds to the task duration, and its position corresponds to the time of day." 
          },
          { 
            q: "Is my data stored locally or in the cloud?", 
            a: "Your tasks are synced to your account. This ensures that your schedule is consistent across different devices while maintaining a fast, client-side experience." 
          },
          { 
            q: "Does it support mobile devices?", 
            a: "Yes. The interface is fully responsive. On smaller screens, the layout stacks to prioritize the clock visualization at the top, followed by your daily summary and navigation." 
          },
          { 
            q: "How do I edit or delete a task?", 
            a: "Simply click or tap directly on the task arc within the clock. This will open the task form where you can modify the name, time, color, or remove the task entirely." 
          }
        ].map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid #222", padding: "30px 0" }}>
            <p style={{ fontWeight: "600", fontSize: "18px", marginBottom: "12px", color: "#818cf8" }}>{item.q}</p>
            <p style={{ color: "#a3a3a3", fontSize: "16px", lineHeight: "1.6" }}>{item.a}</p>
          </div>
        ))}
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: "120px 20px", textAlign: "center" }}>
        <div style={{ 
          backgroundColor: "#111", 
          padding: "80px 40px", 
          borderRadius: "12px", 
          border: "1px solid #222",
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "20px" }}>Start visual planning.</h2>
          <p style={{ fontSize: "18px", marginBottom: "40px", color: "#a3a3a3" }}>Experience a more intuitive way to manage your 24 hours.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{
              backgroundColor: "white", color: "black", border: "none",
              padding: "18px 48px", borderRadius: "6px", fontSize: "16px",
              fontWeight: "600", cursor: "pointer"
            }}
          >
            OPEN DASHBOARD
          </button>
        </div>
      </section>

      <footer style={{ padding: "40px 20px", borderTop: "1px solid #111", textAlign: "center", color: "#444" }}>
        <p>© 2026 Arcadia. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;