"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const DEMO_TASKS = [
  { id: "3bf9cb22-6859-4191-bb36-17a972fa6136", name: "Sleep", start: 0, end: 450, color: "#1e3a5f" },
  { id: "6d481fc0-c92a-4e0a-a4e0-f1b0b96eb8cc", name: "Morning routine", start: 480, end: 540, color: "#ffd166" },
  { id: "60578711-ed25-452d-a77a-312ec731b366", name: "Work", start: 540, end: 780, color: "#3b82f6" },
  { id: "8065a176-93ed-4d1e-9689-26d1060537eb", name: "Lunch", start: 780, end: 870, color: "#22c55e" },
  { id: "29ee453c-d14a-4f3e-adbb-b9c80a3655b2", name: "Creative projects", start: 870, end: 1080, color: "#a78bfa" },
  { id: "d7231c79-68c7-4c0f-905a-a1b122b9f809", name: "Entertainment", start: 1080, end: 1320, color: "#f472b6" }
];

const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [animatedMinutes, setAnimatedMinutes] = useState(480);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedMinutes((prev) => (prev + 1) % 1440);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && user) {
        router.push('/dashboard');
    }
  }, [user, loading, router]);

  const clockSize = 440;
  const center = clockSize / 2;
  const radius = (clockSize / 2) * 0.72;
  const circumference = 2 * Math.PI * radius;
  const arcWidth = 28;

  const getRotation = (minutes: number) => (minutes / 1440) * 360 - 90;
  const handAngle = (animatedMinutes / 1440) * 360;

  const features = [
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
  ];

  return (
    <div style={{
      backgroundColor: "#0B0F1A",
      color: "white",
      fontFamily: "var(--font-geist-sans), sans-serif",
      overflowX: "hidden"
    }}>

      <section style={{
        minHeight: "95vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        maxWidth: "1280px",
        margin: "0 auto",
        position: "relative",
      }}>
        <style>{`
          .hero-container {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 60px;
            align-items: center;
            width: 100%;
          }
          
          .hero-right-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
          }

          @media (max-width: 1024px) {
            .hero-container {
              grid-template-columns: 1fr;
              text-align: center;
              gap: 50px;
            }
            .hero-left { order: 1; }
            .hero-right { order: 2; display: flex; justify-content: center; }
            
            .hero-right-wrapper {
              max-width: 380px;
              margin: 0 auto;
            }
          }

          @media (max-width: 480px) {
            .hero-right-wrapper {
              max-width: 290px;
            }
          }

          .feature-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
            margin-bottom: 120px;
          }

          .feature-row.reverse .feature-text-block {
            order: 2;
          }
          .feature-row.reverse .feature-visual-frame {
            order: 1;
          }

          .feature-visual-frame {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #111420;
            border: 1px solid #1e2638;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
            padding: 24px;
            box-sizing: border-box;
            width: 100%;
          }

          .feature-image {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 8px;
          }

          @media (max-width: 768px) {
            .feature-row, .feature-row.reverse {
              grid-template-columns: 1fr;
              gap: 32px;
              margin-bottom: 80px;
            }
            .feature-row .feature-text-block { order: 2 !important; }
            .feature-row .feature-visual-frame { order: 1 !important; }
            
            .feature-visual-frame {
              padding: 16px;
            }
          }
        `}</style>

        <div className="hero-container">
          <div className="hero-left" style={{ zIndex: 1 }}>
            <p style={{ letterSpacing: "4px", color: "#a3a3a3", fontSize: "13px", textTransform: "uppercase", marginBottom: "20px", fontWeight: "500" }}>
              Visual time management software
            </p>
            <h1 style={{ fontSize: "clamp(32px, 5.5vw, 76px)", fontWeight: "600", lineHeight: "1.1", margin: "0 0 24px 0", letterSpacing: "-2px" }}>
              Stop losing track of hours.<br />See your day on a <span style={{ color: "#818cf8" }}>24-hour circle.</span>
            </h1>
            <p style={{ fontSize: "18px", color: "#a3a3a3", maxWidth: "600px", margin: "0 auto 40px 0", lineHeight: "1.6" }}>
              Arcadia maps your to-do items onto a beautiful clock face. If you struggle with time blindness or get overwhelmed by text-heavy lists, this shows you instantly how much time you have left between tasks.
            </p>
            
            <div data-nosnippet>
              <button 
                onClick={() => router.push('/dashboard')}
                style={{
                  backgroundColor: "white", color: "black", border: "none",
                  padding: "18px 44px", borderRadius: "6px", fontSize: "16px",
                  fontWeight: "600", cursor: "pointer", transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                TRY ARCADIA FREE
              </button>
            </div>
          </div>

          <div className="hero-right" style={{ display: "flex", justifyContent: "center", position: "relative", width: "100%" }}>
            <div className="hero-right-wrapper">
              <div style={{
                position: "relative",
                padding: "20px",
                background: "radial-gradient(circle at center, rgba(129, 140, 248, 0.04) 0%, transparent 70%)",
                borderRadius: "50%",
                width: "100%",
                boxSizing: "border-box"
              }}>
                <svg
                  viewBox={`0 0 ${clockSize} ${clockSize}`}
                  style={{ 
                    display: "block", 
                    filter: "drop-shadow(0 0 24px rgba(0,0,0,0.5))",
                    width: "100%",
                    height: "auto"
                  }}
                >
                  {Array.from({ length: 288 }).map((_, i) => {
                    const mins = i * 5;
                    let length = 4;
                    let color = "rgba(255, 255, 255, 0.25)";
                    if (mins % 360 === 0) { length = 12; color = "rgba(255, 255, 255, 0.8)"; }
                    else if (mins % 60 === 0) { length = 9; color = "rgba(255, 255, 255, 0.5)"; }
                    else if (mins % 20 === 0) { length = 6; color = "rgba(255, 255, 255, 0.35)"; }
                    return (
                      <line
                        key={mins}
                        x1={center} y1={center - radius - 10}
                        x2={center} y2={center - radius - 10 - length}
                        stroke={color}
                        strokeWidth="1"
                        transform={`rotate(${(mins / 1440) * 360} ${center} ${center})`}
                      />
                    );
                  })}

                  {[0, 6, 12, 18].map((h) => {
                    const angle = (h / 24) * 360 - 90;
                    const labelR = radius + 30;
                    const lx = center + labelR * Math.cos((angle * Math.PI) / 180);
                    const ly = center + labelR * Math.sin((angle * Math.PI) / 180);
                    return (
                      <text key={h} x={lx} y={ly} fill="rgba(255, 255, 255, 0.4)" fontSize="11px"
                        fontWeight="600" textAnchor="middle" dominantBaseline="central" letterSpacing="0.5px">
                        {h === 0 ? "00:00" : `${h}:00`}
                      </text>
                    );
                  })}

                  {DEMO_TASKS.map((task) => {
                    const duration = task.end - task.start;
                    const strokeLength = (duration / 1440) * circumference;
                    const rotDeg = getRotation(task.start);
                    const startOffset = ((rotDeg + 90) / 360) * circumference;
                    const textOffset = startOffset + strokeLength / 2;

                    return (
                      <g key={task.id}>
                        <circle
                          cx={center} cy={center} r={radius}
                          fill="none"
                          stroke={task.color}
                          strokeWidth={arcWidth}
                          strokeOpacity="0.35"
                          strokeDasharray={`${strokeLength} ${circumference}`}
                          strokeDashoffset={hasLoaded ? 0 : strokeLength}
                          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
                          transform={`rotate(${rotDeg} ${center} ${center})`}
                        />
                        <path
                          id={`landing-path-${task.id}`}
                          d={`M ${center},${center - radius} a ${radius},${radius} 0 1,1 0,${2 * radius} a ${radius},${radius} 0 1,1 0,-${2 * radius}`}
                          fill="none"
                        />
                        <text fill={task.color} fontSize="10px" fontWeight="600" opacity="0.85" letterSpacing="0.2px">
                          <textPath href={`#landing-path-${task.id}`} startOffset={textOffset} textAnchor="middle" dominantBaseline="central">
                            {task.name}
                          </textPath>
                        </text>
                      </g>
                    );
                  })}

                  <circle
                    cx={center + radius * Math.sin((handAngle * Math.PI) / 180)}
                    cy={center - radius * Math.cos((handAngle * Math.PI) / 180)}
                    r="5" 
                    fill="white" 
                    style={{ filter: "drop-shadow(0 0 6px white)" }}
                  />

                  <text x={center} y={center - 12} fill="white" fontSize="42px" fontWeight="600"
                    textAnchor="middle" dominantBaseline="central" letterSpacing="-1px">
                    {minutesToTime(animatedMinutes)}
                  </text>
                  <text x={center} y={center + 26} fill="#818cf8" fontSize="11px"
                    textAnchor="middle" letterSpacing="3px" fontWeight="600">
                    LIVE DEMO
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "100px 20px 60px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "90px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "600", marginBottom: "16px", letterSpacing: "-0.5px" }}>
            Built differently than a standard to-do list
          </h2>
          <p style={{ color: "#a3a3a3", fontSize: "16px", maxWidth: "550px", margin: "0 auto", lineHeight: "1.6" }}>
            Designed specifically to bridge the gap between planning daily goals and understanding real chronological limits.
          </p>
        </div>

        <div>
          {features.map((f, i) => {
            const isOdd = i % 2 !== 0;
            return (
              <div key={i} className={`feature-row ${isOdd ? 'reverse' : ''}`}>
                <div className="feature-text-block" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ width: "40px", height: "4px", backgroundColor: "#818cf8", marginBottom: "24px" }} />
                  <h3 style={{ fontSize: "26px", marginBottom: "18px", fontWeight: "600", color: "white", letterSpacing: "-0.5px" }}>
                    {f.title}
                  </h3>
                  <p style={{ color: "#a3a3a3", lineHeight: "1.7", fontSize: "16px", margin: 0 }}>
                    {f.desc}
                  </p>
                </div>

                <div className="feature-visual-frame">
                  <img src={f.img} alt={f.title} className="feature-image" />
                </div>

              </div>
            );
          })}
        </div>
      </section>

      <section data-nosnippet style={{ 
        padding: "80px 0", 
        backgroundColor: "#0B0F1A", 
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
        <h2 style={{ fontSize: "32px", marginBottom: "40px", textAlign: "left", fontWeight: "600" }}>Questions & Answers</h2>
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
                fontWeight: "600", cursor: "pointer", transition: "transform 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              SIGN UP FOR FREE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}