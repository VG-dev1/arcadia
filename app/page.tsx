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
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          border: "2px solid rgba(255, 255, 255, 0.05)",
          pointerEvents: "none",
          zIndex: 0
        }}>
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            border: "6px solid transparent",
            borderTop: "6px solid #818cf8",
            pointerEvents: "none",
            zIndex: 0,
            filter: "drop-shadow(0 0 12px #818cf8)"
          }} />
        </div>

        <div style={{ zIndex: 1 }}>
          <p style={{ letterSpacing: "4px", color: "#a3a3a3", fontSize: "14px", textTransform: "uppercase", marginBottom: "20px" }}>
            Visual time management software
          </p>
          <h1 style={{ fontSize: "clamp(48px, 8vw, 90px)", fontWeight: "600", lineHeight: "1", margin: "0 0 30px 0", letterSpacing: "-2px" }}>
            Stop losing track of hours.<br />See your day on a <span style={{ color: "#818cf8" }}>24-hour circle.</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#a3a3a3", maxWidth: "600px", margin: "0 auto 40px auto", lineHeight: "1.6" }}>
            Arcadia maps your to-do items onto a clock face. If you struggle with time blindness or get overwhelmed by text-heavy to-do lists, this shows you exactly how much time you have left between tasks.
          </p>
          
          <div data-nosnippet>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: "white", color: "black", border: "none",
                padding: "18px 48px", borderRadius: "6px", fontSize: "16px",
                fontWeight: "600", cursor: "pointer"
              }}
            >
              TRY ARCADIA FREE
            </button>
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", marginBottom: "60px" }}>
          Built differently than a standard to-do list
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
            {[
                { 
                title: "The Clock Face Layout", 
                desc: "Your events are drawn as solid blocks of color directly on a 24-hour wheel. You can spot open gaps in your schedule immediately without reading time stamps.",
                img: "/clock.png" 
                },
                { 
                  title: "Simple Time Tracking Logs",
                  desc: "Arcadia logs your completed events automatically. Look back at your charts from last week to see where your time actually went, then adjust your upcoming schedule based on real numbers.",
                  img: "/daily-summary.png" 
                },
                { 
                title: "One-Task View", 
                desc: "Hide the rest of your day when you need to work. This view keeps only your current task visible on the dial, acting as a constant visual anchor so you don't wander off.",
                img: "/focus-mode.png" 
                },
                {
                  title: "Valuable Insights",
                  desc: "Arcadia tracks your time usage and gives you personalized insights about your habits. See which hours you are most productive, how long you spend on different types of tasks, and where you can find hidden pockets of free time.",
                  img: "/insights.png"
                }
            ].map((f, i) => (
                <article key={i} style={{ 
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
                </article>
            ))}
        </div>
      </section>
      
      <section data-nosnippet style={{ 
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
            Feedback from current users
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
            { name: "Alex R.", review: "I have terrible ADHD and numbers on a digital calendar don't mean anything to my brain. Seeing a physical block of color actually works." },
            { name: "Sarah M.", review: "Simple layout. The single-task focus screen stops me from jumping between tabs when I get distracted." },
            { name: "Jordan K.", review: "It syncs across all my devices seamlessly." },
            { name: "Elena V.", review: "The round design makes sense to me. Standard line items always made me feel like I was falling behind." },
            { name: "Marcus T.", review: "I usually open planning apps, use them for three days, and forget they exist. I've used this one every morning for a month." }
            ].concat([
            { name: "Alex R.", review: "I have terrible ADHD and numbers on a digital calendar don't mean anything to my brain. Seeing a physical block of color actually works." },
            { name: "Sarah M.", review: "Simple layout. The single-task focus screen stops me from jumping between tabs when I get distracted." },
            { name: "Jordan K.", review: "It syncs across all my devices seamlessly." },
            { name: "Elena V.", review: "The round design makes sense to me. Standard line items always made me feel like I was falling behind." },
            { name: "Marcus T.", review: "I usually open planning apps, use them for three days, and forget they exist. I've used this one every morning for a month." }
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

      <section style={{ padding: "100px 20px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "32px", marginBottom: "40px", textAlign: "left" }}>Questions & Answers</h2>
        {[
          { 
            q: "How does this help with time blindness?", 
            a: "When tasks are just lines of text on a screen, it is easy to forget they take up real space in the physical world. Arcadia scales your events into proportional shapes around a 24-hour dial. When you look at the screen, you can see if an upcoming task takes up a small slice of your afternoon or half of it." 
          },
          { 
            q: "Where is my calendar data kept?", 
            a: "Everything links to an online account so your data matches across your laptop and phone."
          },
          { 
            q: "Does this work on mobile devices?", 
            a: "Yes. The site reshapes itself for mobile layouts." 
          },
          { 
            q: "How do I make changes to a task?", 
            a: "Click or tap directly on the slice of time you want to alter on the clock wheel. A window pops up where you can type a new title, drag the handles to change the duration, swap the color indicator, or remove it entirely." 
          }
        ].map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid #222", padding: "30px 0" }}>
            <h3 style={{ fontWeight: "600", fontSize: "18px", marginBottom: "12px", color: "#818cf8" }}>{item.q}</h3>
            <p style={{ color: "#a3a3a3", fontSize: "16px", lineHeight: "1.6" }}>{item.a}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: "120px 20px", textAlign: "center" }}>
        <div style={{ 
          backgroundColor: "#111", 
          padding: "80px 40px", 
          borderRadius: "12px", 
          border: "1px solid #222",
          maxWidth: "1000px",
          margin: "0 auto"
        }}>
          <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "20px" }}>Set up your wheel.</h2>
          <p style={{ fontSize: "18px", marginBottom: "40px", color: "#a3a3a3" }}>Create an account to see your schedule mapped out as a visual day cycle.</p>
          <div data-nosnippet>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: "white", color: "black", border: "none",
                padding: "18px 48px", borderRadius: "6px", fontSize: "16px",
                fontWeight: "600", cursor: "pointer"
              }}
            >
              SIGN UP FOR FREE
            </button>
          </div>
        </div>
      </section>

      <footer style={{ padding: "40px 20px", borderTop: "1px solid #111", textAlign: "center", color: "#444" }}>
        <p>© 2026 Arcadia. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;