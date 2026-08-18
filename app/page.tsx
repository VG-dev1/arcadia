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

  const TOTAL_DEMOS = 4;
  const [activeDemo, setActiveDemo] = useState(0);
  const [demoPaused, setDemoPaused] = useState(false);
  const [demoTick, setDemoTick] = useState(0);

  useEffect(() => {
    if (demoPaused) return;
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % TOTAL_DEMOS);
      setDemoTick((t) => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [demoPaused, demoTick]);

  const goToDemo = (index: number) => {
    setActiveDemo(((index % TOTAL_DEMOS) + TOTAL_DEMOS) % TOTAL_DEMOS);
    setDemoTick((t) => t + 1);
  };

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

  return (
    <div style={{
      backgroundColor: "#0B0F1A",
      color: "white",
      fontFamily: "var(--font-geist-sans), sans-serif",
      overflowX: "hidden"
    }}>
      <style>{`
        .hero-left {
          width: 100%;
          max-width: 760px;
          text-align: center;
        }

        .hero-left p {
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .hero-right-wrapper {
          width: 100%;
          max-width: 520px;
          display: flex;
          justify-content: center;
        }

        .demo-carousel {
          position: relative;
          width: 100%;
          max-width: 1040px;
          margin: 0 auto;
          overflow: hidden;
        }

        .demo-grid {
          display: flex;
          width: 100%;
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
          gap: 12px;
        }

        .demo-card {
          display: flex;
          flex-direction: column;
          flex: 0 0 100%;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid #1e2638;
          border-radius: 20px;
          padding: 12px;
          box-sizing: border-box;
          height: 540px;
          overflow: hidden;
        }

        .demo-card-title {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 20px 0;
          flex-shrink: 0;
        }

        .demo-content-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          overflow: hidden;
        }

        .demo-learn-more {
          background: none;
          border: 1px solid #fff;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          padding: 9px 15px;
          border-radius: 6px;
          cursor: pointer;
          align-self: flex-start;
          flex-shrink: 0;
          margin-bottom: 18px;
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #2a3148;
          background: rgba(17, 20, 32, 0.9);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .carousel-arrow.prev {
          left: 12px;
        }

        .carousel-arrow.next {
          right: 12px;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 28px;
        }

        .carousel-dot {
          width: 8px;
          height: 8px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: #2a3148;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .carousel-dot.active {
          background: #80ef08;
          transform: scale(1.3);
        }

        @media (max-width: 768px) {
          .demo-card {
            padding: 16px;
            height: 540px;
          }

          .hero-right-wrapper {
            max-width: 290px;
          }

          .carousel-arrow {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

      <section style={{
        minHeight: "55vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px 60px",
        boxSizing: "border-box"
      }}>
        <div className="hero-left" style={{ zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(32px, 5.5vw, 76px)", fontWeight: "600", lineHeight: "1.1", margin: "0 0 24px 0", letterSpacing: "-2px" }}>
            One day. Many ways to <span style={{ color: "#80ef08" }}>see it.</span>
          </h1>
          <p style={{ fontSize: "18px", color: "#a3a3a3", maxWidth: "600px", margin: "0 auto 40px", lineHeight: "1.6" }}>
            See your tasks as a clock, calendar, list, or focus timer. All synced together in one workspace.
          </p>

          <div data-nosnippet style={{ display: "flex", gap: "32px", justifyContent: "center", alignItems: "center" }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: "white", color: "black", border: "none",
                padding: "9px 15px", borderRadius: "6px", fontSize: "16px",
                fontWeight: "600", cursor: "pointer"
              }}
            >
              Try Arcadia for free
            </button>
            <button
              onClick={() => router.push('/features')}
              style={{
                backgroundColor: "none", color: "white", border: "1px solid #fff",
                padding: "9px 15px", borderRadius: "6px", fontSize: "16px",
                fontWeight: "600", cursor: "pointer"
              }}
            >
              Explore features
            </button>
          </div>
        </div>
      </section>

      <section>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <p style={{ fontSize: "28px", fontWeight: "600", color: "#fff", margin: 0 }}>
            You don't lack time; you lack a visual version of it
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "30px" }}>
            <div style={{ border: "1px solid #1e2638", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                  <span>✕</span>
                </div>
                <p style={{ fontSize: "16px", margin: 0 }}>Flat todo lists</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                  <span>✓</span>
                </div>
                <p style={{ fontSize: "16px", margin: 0 }}>Time visualisation</p>
              </div>
            </div>

            <div style={{ border: "1px solid #1e2638", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                  <span>✕</span>
                </div>
                <p style={{ fontSize: "16px", margin: 0 }}>Multiple task-based apps</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                  <span>✓</span>
                </div>
                <p style={{ fontSize: "16px", margin: 0 }}>Only one</p>
              </div>
            </div>

            <div style={{ border: "1px solid #1e2638", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                  <span>✕</span>
                </div>
                <p style={{ fontSize: "16px", margin: 0 }}>Overwhelming design</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", border: "1px solid #1e2638", borderRadius: "50%" }}>
                  <span>✓</span>
                </div>
                <p style={{ fontSize: "16px", margin: 0 }}>Calm and minimalistic design</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{
        width: "100%",
        padding: "30px 40px",
        boxSizing: "border-box",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <p style={{ fontSize: "28px", fontWeight: "600", color: "#fff", margin: 0 }}>
              Choose the view that fits you
            </p>
          </div>

          <div
            className="demo-carousel"
            onMouseEnter={() => setDemoPaused(true)}
            onMouseLeave={() => setDemoPaused(false)}
          >
            <div className="demo-grid" style={{ transform: `translateX(-${activeDemo * 100}%)` }}>
            <div className="demo-card">
              <button className="demo-learn-more" onClick={() => router.push('/features/views#clock-view')}>Learn more</button>
              <h3 className="demo-card-title">Clock</h3>
              <div className="demo-content-body">
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
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-card">
              <button className="demo-learn-more" onClick={() => router.push('/features/views#todo-view')}>Learn more</button>
              <h3 className="demo-card-title">Classic todo</h3>
              <div className="demo-content-body" style={{ gap: "12px", justifyContent: "flex-start", overflowY: "auto" }}>
                {DEMO_TASKS.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: "16px",
                      border: "1px solid #1a1a1a",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      backgroundColor: "#0b0e1a",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: "4px", minHeight: "32px", backgroundColor: task.color, borderRadius: "2px", opacity: 0.8 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                        {task.name}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#a3a3a3", letterSpacing: "0.5px" }}>
                        {`${String(Math.floor(task.start / 60)).padStart(2, '0')}:${String(task.start % 60).padStart(2, '0')} – ${String(Math.floor(task.end / 60)).padStart(2, '0')}:${String(task.end % 60).padStart(2, '0')}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="demo-card">
              <button className="demo-learn-more" onClick={() => router.push('/features/views#calendar-view')}>Learn more</button>
              <h3 className="demo-card-title">Calendar</h3>
              <div className="demo-content-body" style={{ overflowX: "auto", overflowY: "auto", justifyContent: "flex-start" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "50px repeat(7, minmax(80px, 1fr))",
                    border: "1px solid #1e2638",
                    borderRadius: "8px",
                    overflow: "hidden",
                    fontSize: "12px",
                    minWidth: "600px"
                  }}
                >
                  <div
                    style={{
                      borderRight: "1px solid #1e2638",
                      borderBottom: "1px solid #1e2638",
                    }}
                  />

                  {[
                    { day: "MON", date: "12/10", active: false },
                    { day: "TUE", date: "12/11", active: true },
                    { day: "WED", date: "12/12", active: false },
                    { day: "THU", date: "12/13", active: false },
                    { day: "FRI", date: "12/14", active: false },
                    { day: "SAT", date: "12/15", active: false },
                    { day: "SUN", date: "12/16", active: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        height: 48,
                        padding: "6px",
                        textAlign: "center",
                        fontWeight: 600,
                        borderRight: "1px solid #1e2638",
                        borderBottom: "1px solid #1e2638",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ color: item.active ? "#80ef08" : "#a3a3a3" }}>{item.day}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: item.active ? "#80ef08" : "#525252",
                          marginTop: 2,
                        }}
                      >
                        {item.date}
                      </div>
                    </div>
                  ))}

                  {[8, 9, 10, 11, 12, 13, 14].map((hour) => (
                    <React.Fragment key={hour}>
                      <div
                        style={{
                          height: 54,
                          padding: "6px",
                          textAlign: "right",
                          fontSize: 11,
                          color: "#525252",
                          borderRight: "1px solid #1e2638",
                          borderBottom: "1px solid #1e2638",
                          boxSizing: "border-box",
                        }}
                      >
                        {`${String(hour).padStart(2, "0")}:00`}
                      </div>

                      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                        const dummyTasksSlot = DEMO_TASKS.filter((task) => {
                          const taskStartHour = Math.floor(task.start / 60);
                          const taskDayIndex = 1;
                          return taskStartHour === hour && taskDayIndex === dayIndex;
                        });

                        return (
                          <div
                            key={dayIndex}
                            style={{
                              position: "relative",
                              height: 54,
                              borderRight: "1px solid #1e2638",
                              borderBottom: "1px solid #1e2638",
                              background: "#0B0E1A",
                              boxSizing: "border-box",
                            }}
                          >
                            {dummyTasksSlot.map((task) => {
                              const durationMinutes = task.end - task.start;
                              const topOffset = (task.start % 60) * (54 / 60);
                              const taskHeight = (durationMinutes / 60) * 54;

                              return (
                                <div
                                  key={task.id}
                                  style={{
                                    position: "absolute",
                                    top: `${topOffset}px`,
                                    left: 2,
                                    right: 2,
                                    height: `${taskHeight - 4}px`,
                                    zIndex: 2,
                                    overflow: "hidden",
                                    textAlign: "left",
                                    padding: "4px 6px",
                                    borderLeft: `3px solid ${task.color}`,
                                    borderRadius: "4px",
                                    background: "#161b2e",
                                    color: "white",
                                    boxSizing: "border-box",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {task.name}
                                  </span>
                                  <span
                                    style={{
                                      display: "block",
                                      fontSize: 9,
                                      color: "#a3a3a3",
                                      marginTop: 2,
                                    }}
                                  >
                                    {`${Math.round((durationMinutes / 60) * 10) / 10}h`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="demo-card">
              <h3 className="demo-card-title">One task & pomodoro</h3>
              {(() => {
                const DURATION_SECONDS = 60 * 60; // 60 minutes
                const TASK = { name: "Work", color: "#38bdf8" };

                const [secondsLeft, setSecondsLeft] = React.useState(DURATION_SECONDS);

                React.useEffect(() => {
                  const timer = setInterval(() => {
                    setSecondsLeft((prev) => (prev <= 1 ? DURATION_SECONDS : prev - 1));
                  }, 1000);
                  return () => clearInterval(timer);
                }, []);

                const secondsElapsed = DURATION_SECONDS - secondsLeft;
                const progressPercent = (secondsElapsed / DURATION_SECONDS) * 100;

                const radius = 140;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (secondsElapsed / DURATION_SECONDS) * circumference;

                const formatTimeLeft = (totalSecs: number) => {
                  if (totalSecs <= 0) return "00:00";
                  const mins = Math.floor(totalSecs / 60);
                  const secs = totalSecs % 60;
                  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                };

                return (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h1 style={{ 
                      fontSize: "48px", 
                      fontFamily: "var(--font-geist-sans), sans-serif", 
                      letterSpacing: "2.5px", 
                      textTransform: "uppercase", 
                      margin: "0 0 40px 0", 
                      color: "#ffffff" 
                    }}>
                      {TASK.name}
                    </h1>

                    <div style={{ position: "relative", width: "min(320px, 100%)", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                        <circle
                          cx="160"
                          cy="160"
                          r={radius}
                          fill="transparent"
                          stroke="#1a1a1a"
                          strokeWidth="8"
                        />
                        <circle
                          cx="160"
                          cy="160"
                          r={radius}
                          fill="transparent"
                          stroke={TASK.color}
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 0.2s ease-out" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", color: "#ffffff" }}>
                        <span style={{ fontSize: "48px", fontWeight: "bold", fontVariantNumeric: "tabular-nums" }}>
                          {formatTimeLeft(secondsLeft)}
                        </span>
                        <span style={{ fontSize: "11px", opacity: 0.5, letterSpacing: "1px", marginTop: "4px" }}>
                          {Math.floor(progressPercent)}% COMPLETE
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <button
            className="carousel-arrow prev"
            onClick={() => goToDemo(activeDemo - 1)}
            aria-label="Previous demo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            className="carousel-arrow next"
            onClick={() => goToDemo(activeDemo + 1)}
            aria-label="Next demo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="carousel-dots">
            {Array.from({ length: TOTAL_DEMOS }).map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === activeDemo ? " active" : ""}`}
                onClick={() => goToDemo(i)}
                aria-label={`Go to demo ${i + 1}`}
              />
            ))}
          </div>
          </div>
        </div>
      </section>

      <section data-nosnippet style={{ 
        padding: "30px 20px", 
        backgroundColor: "#0B0F1A",
        width: "100%",
        boxSizing: "border-box"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{
            textAlign: "center",
            fontSize: "28px",
            fontWeight: "600",
            color: "#fff",
            margin: "0 0 40px 0"
          }}>
            What users are saying
          </p>

          <div           
            style={{
              display: "flex",
              gap: "20px",
              overflowX: "auto",
              paddingBottom: "16px",
              scrollSnapType: "x mandatory"
            }}
          >
            {[
              { 
                name: "u/steepbuilding24", 
                review: "The clock visualization idea is actually pretty clever, most task apps just copy each other with the same list format.",
                source: "r/micro_saas"
              },
              { 
                name: "u/Livid_Finding", 
                review: "I like the minimalist approach! Does your app sync with external sources? I support your app.",
                source: "r/ProductivityApps"
              },
              { 
                name: "u/CockatooCocktail", 
                review: "An artisanal piece of software, how unique! You're up to something great!",
                source: "r/SaaS"
              },
            ].map((r, i) => (
              <div key={i} style={{
                minWidth: "300px",
                maxWidth: "360px",
                padding: "28px",
                borderRadius: "16px",
                border: "1px solid #1e2638",
                flexShrink: 0,
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ color: "#ff4500", fontSize: "12px", fontWeight: "600" }}>
                      {r.source}
                    </span>
                  </div>

                  <p style={{ color: "#fff", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                    "{r.review}"
                  </p>
                </div>

                <p style={{ color: "#80ef08", fontSize: "13px", fontWeight: "600", margin: 0, fontFamily: "monospace" }}>
                  {r.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "120px 0px", textAlign: "center" }}>
        <div style={{ 
          padding: "50px 40px", 
          width: "100%",
          boxSizing: "border-box"
        }}>
          <h2 style={{ fontSize: "40px", fontWeight: "600", marginBottom: "20px" }}>Get started today.</h2>
          <div data-nosnippet>
            <button 
              onClick={() => router.push('/dashboard')}
              style={{
                backgroundColor: "white", color: "black", border: "none",
                padding: "9px 15px", borderRadius: "6px", fontSize: "16px",
                fontWeight: "600", cursor: "pointer"
              }}
            >
              Get Arcadia for free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}