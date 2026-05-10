"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

interface Task {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
}

const PRESET_COLORS = [
  "#ffffff", "#a3a3a3", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#38bdf8", "#818cf8",
  "#e879f9", "#f43f5e",
];

const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getDateLabel = (d: Date, today: Date): string => {
  const dk = dateKey(d);
  const todayK = dateKey(today);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (dk === todayK) return "Today";
  if (dk === dateKey(yesterday)) return "Yesterday";
  if (dk === dateKey(tomorrow)) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase();
};

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0,
      backgroundColor: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: "#111",
        border: "1px solid #fff",
        borderRadius: "12px",
        padding: "36px",
        minWidth: "380px",
        maxWidth: "90vw",
        color: "white",
        fontFamily: "var(--font-cuprum), sans-serif",
      }}
    >
      {children}
    </div>
  </div>
);

const ModalLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: "block", fontSize: "11px", letterSpacing: "1.5px", color: "#fff", marginBottom: "8px", textTransform: "uppercase" }}>
    {children}
  </label>
);

const ModalInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={{
      width: "100%",
      backgroundColor: "#1a1a1a",
      border: "1px solid #fff",
      borderRadius: "6px",
      color: "white",
      padding: "10px 12px",
      fontSize: "15px",
      fontFamily: "var(--font-cuprum), sans-serif",
      outline: "none",
      boxSizing: "border-box",
      ...props.style,
    }}
  />
);

interface TaskFormProps {
  initial?: Partial<Task>;
  onSave: (task: Omit<Task, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
  title: string;
  currentKey: string; 
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  initial, 
  onSave, 
  onDelete, 
  onClose, 
  title, 
  currentKey 
}) => {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [startTime, setStartTime] = useState(minutesToTime(initial?.start ?? 480));
  const [endTime, setEndTime] = useState(minutesToTime(initial?.end ?? 540));
  const [color, setColor] = useState(initial?.color ?? "#ffffff");
  const [useCustom, setUseCustom] = useState(
    initial?.color ? !PRESET_COLORS.includes(initial.color) : false
  );
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (end <= start) return;
    onSave({ name: name.trim(), start, end, color });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 28px 0", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>
        {title}
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <ModalLabel>Task name</ModalLabel>
        <ModalInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning run 🏃"
          autoFocus
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <ModalLabel>Start time</ModalLabel>
          <ModalInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <ModalLabel>End time</ModalLabel>
          <ModalInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: "28px" }}>
        <ModalLabel>Colour</ModalLabel>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setUseCustom(false); }}
              style={{
                width: "28px", height: "28px",
                borderRadius: "50%",
                backgroundColor: c,
                border: (!useCustom && color === c) ? "2px solid white" : "2px solid transparent",
                outline: (!useCustom && color === c) ? "1px solid #fff" : "none",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            />
          ))}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setUseCustom(true); colorPickerRef.current?.click(); }}
              style={{
                width: "28px", height: "28px",
                borderRadius: "50%",
                background: useCustom
                  ? color
                  : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                border: useCustom ? "2px solid white" : "2px solid transparent",
                outline: useCustom ? "1px solid #fff" : "none",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
              title="Custom colour"
            />
            <input
              ref={colorPickerRef}
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); setUseCustom(true); }}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        {onDelete ? (
          <button
            onClick={() => { onDelete(); onClose(); }}
            style={{
              background: "none", border: "1px solid #3a1a1a",
              color: "#ef4444", padding: "10px 18px",
              borderRadius: "6px", cursor: "pointer",
              fontSize: "13px", fontFamily: "var(--font-cuprum), sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            Delete
          </button>
        ) : <span />}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              if (initial?.id) {
                router.push(`/focus?id=${initial.id}&date=${currentKey}`);
              }
            }}
            style={{
              background: "purple", border: "none",
              color: "white", padding: "10px 22px",
              borderRadius: "6px", cursor: "pointer",
              fontSize: "13px", fontWeight: "600",
              fontFamily: "var(--font-cuprum), sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            Focus
          </button>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "1px solid #fff",
              color: "#fff", padding: "10px 18px",
              borderRadius: "6px", cursor: "pointer",
              fontSize: "13px", fontFamily: "var(--font-cuprum), sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: "white", border: "none",
              color: "black", padding: "10px 22px",
              borderRadius: "6px", cursor: "pointer",
              fontSize: "13px", fontWeight: "600",
              fontFamily: "var(--font-cuprum), sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ClockAppContent: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [dayOffset, setDayOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [clockSize, setClockSize] = useState(520);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { allTasks, addTask, updateTask, deleteTask } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) {
          setClockSize(width * 0.85);
        } else if (width < 1024) {
          setClockSize(400);
        } else {
          setClockSize(520);
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const today = new Date(now);
  const viewedDate = new Date(now);
  viewedDate.setDate(now.getDate() + dayOffset);
  const currentKey = dateKey(viewedDate);
  const tasks: Task[] = allTasks[currentKey] ?? [];

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddTask = async (t: Omit<Task, "id">) => {
    setIsSaving(true);
    try {
      await addTask(currentKey, { ...t, id: crypto.randomUUID() });
    } catch (error) {
      alert('Error adding task: ' + (error as any).message);
    }
    setIsSaving(false);
  };

  const handleUpdateTask = async (id: string, t: Omit<Task, "id">) => {
    setIsSaving(true);
    try {
      await updateTask(currentKey, id, t);
    } catch (error) {
      alert('Error updating task: ' + (error as any).message);
    }
    setIsSaving(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Are you sure to delete the task?")) {
      setIsSaving(true);
      try {
        await deleteTask(currentKey, id);
        setEditingTask(null);
      } catch (error) {
        alert('Error deleting task: ' + (error as any).message);
      }
      setIsSaving(false);
    }
  };

  const center = clockSize / 2;
  const radius = (clockSize / 2) * 0.73;
  const circumference = 2 * Math.PI * radius;
  const arcWidth = (clockSize / 520) * 34;

  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const dayName = days[viewedDate.getDay()];
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateLabel = getDateLabel(viewedDate, today);

  const getRotation = (minutes: number) => (minutes / 1440) * 360 - 90;

  const isToday = dayOffset === 0;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const handAngle = (currentMinutes / 1440) * 360;

  const handleClockClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    const dist = Math.sqrt(x * x + y * y);
    if (dist < radius - arcWidth || dist > radius + arcWidth) return;

    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    const clickedMinutes = (angle / 360) * 1440;

    const hit = tasks.find((t) => {
      if (t.end > t.start) return clickedMinutes >= t.start && clickedMinutes <= t.end;
      return clickedMinutes >= t.start || clickedMinutes <= t.end;
    });
    if (hit) setEditingTask(hit);
  };

  const totalScheduled = tasks.reduce((acc, t) => acc + (t.end - t.start), 0);

  const navBtnStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid #fff",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "var(--font-cuprum), sans-serif",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{
      backgroundColor: "#000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-cuprum), sans-serif",
      color: "white",
    }}>
      <style>{`
        .main-layout {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 40px 64px;
          flex: 1;
        }
        .summary-col { padding-right: 64px; order: 1; }
        .clock-col { order: 2; display: flex; justify-content: center; }
        .add-col { padding-left: 64px; order: 3; }

        @media (max-width: 1024px) {
          .main-layout {
            grid-template-columns: 1fr;
            padding: 20px;
            text-align: center;
            gap: 40px;
          }
          .summary-col { padding: 0; order: 2; }
          .clock-col { order: 1; }
          .add-col { padding: 0; order: 3; display: flex; flex-direction: column; align-items: center; }
          .nav-group { justify-content: center; }
        }
      `}</style>

      <div className="main-layout">
        <div className="summary-col">
          <div style={{ marginBottom: "40px" }}>
            <p style={{
              fontSize: "11px", letterSpacing: "2.5px", color: "#fff",
              textTransform: "uppercase", margin: "0 0 10px 0",
            }}>
              {dayName}
            </p>
            <p style={{
              fontSize: "40px", fontWeight: "600", margin: "0 0 20px 0",
              lineHeight: 1.1, letterSpacing: "-0.5px",
            }}>
              {dateLabel}
            </p>
            <div className="nav-group" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button style={navBtnStyle} onClick={() => setDayOffset((o) => o - 1)}>← Prev</button>
              {dayOffset !== 0 && (
                <button style={navBtnStyle} onClick={() => setDayOffset(0)}>Today</button>
              )}
              <button style={navBtnStyle} onClick={() => setDayOffset((o) => o + 1)}>Next →</button>
              <button style={navBtnStyle} onClick={() => setShowDateSelect(true)}>Jump To Date</button>
            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "#1a1a1a", marginBottom: "32px" }} />

          <p style={{ fontSize: "11px", letterSpacing: "2.5px", color: "#fff", marginBottom: "20px", textTransform: "uppercase" }}>
            Daily Summary
          </p>

          {tasks.length === 0 ? (
            <p style={{ color: "#fff", fontSize: "14px", lineHeight: "1.6" }}>No tasks yet.</p>
          ) : (
            <>
              <div style={{ maxHeight: "260px", overflowY: "auto", textAlign: "left" }}>
                {[...tasks]
                  .sort((a, b) => a.start - b.start)
                  .map((task) => {
                  const duration = task.end - task.start;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setEditingTask(task)}
                      style={{
                        marginBottom: "14px",
                        paddingBottom: "14px",
                        borderBottom: "1px solid #1a1a1a",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{
                        width: "3px", height: "30px",
                        backgroundColor: task.color,
                        borderRadius: "2px", opacity: 0.7, flexShrink: 0,
                      }} />
                      <div>
                        <p style={{ color: "white", margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600" }}>
                          {task.name}
                        </p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#fff", letterSpacing: "0.5px" }}>
                          {currentMinutes >= task.start && currentMinutes < task.end && isToday ? (
                            <span style={{ fontWeight: "bold", color: task.color }}>NOW</span>
                          ) : (
                            `${minutesToTime(task.start)} – ${minutesToTime(task.end)}`
                          )}
                          {" · "}{formatDuration(task.end - task.start)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "4px", paddingTop: "16px" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#fff", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Total scheduled
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "600", color: "#fff" }}>
                  {formatDuration(totalScheduled)}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="clock-col">
          <svg
            width={clockSize}
            height={clockSize}
            viewBox={`0 0 ${clockSize} ${clockSize}`}
            onClick={handleClockClick}
            style={{ cursor: "default", flexShrink: 0, display: "block" }}
          >
            {Array.from({ length: 288 }).map((_, i) => {
              const mins = i * 5;
              let length = (clockSize / 520) * 4;
              let color = "#fff";
              if (mins % 360 === 0) { length = (clockSize / 520) * 14; color = "white"; }
              else if (mins % 60 === 0) { length = (clockSize / 520) * 10; color = "#fff"; }
              else if (mins % 20 === 0) { length = (clockSize / 520) * 6; color = "#fff"; }
              return (
                <line
                  key={mins}
                  x1={center} y1={center - radius - ((clockSize / 520) * 12)}
                  x2={center} y2={center - radius - ((clockSize / 520) * 12) - length}
                  stroke={color}
                  strokeWidth="1"
                  transform={`rotate(${(mins / 1440) * 360} ${center} ${center})`}
                />
              );
            })}

            {[0, 6, 12, 18].map((h) => {
              const angle = (h / 24) * 360 - 90;
              const labelR = radius + ((clockSize / 520) * 36);
              const lx = center + labelR * Math.cos((angle * Math.PI) / 180);
              const ly = center + labelR * Math.sin((angle * Math.PI) / 180);
              return (
                <text key={h} x={lx} y={ly} fill="#fff" fontSize={`${(clockSize / 520) * 12}px`}
                  textAnchor="middle" dominantBaseline="central">
                  {h === 0 ? "00:00" : `${h}:00`}
                </text>
              );
            })}

            {tasks.map((task) => {
              const duration = task.end - task.start;
              const strokeLength = (duration / 1440) * circumference;
              const rotDeg = getRotation(task.start);
              const startOffset = ((rotDeg + 90) / 360) * circumference;
              const textOffset = startOffset + strokeLength / 2;

              return (
                <g key={task.id} style={{ cursor: "pointer" }}>
                  <circle
                    cx={center} cy={center} r={radius}
                    fill="none"
                    stroke={task.color}
                    strokeWidth={arcWidth}
                    strokeOpacity="0.35"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    transform={`rotate(${rotDeg} ${center} ${center})`}
                  />
                  <path
                    id={`path-${task.id}`}
                    d={`M ${center},${center - radius} a ${radius},${radius} 0 1,1 0,${2 * radius} a ${radius},${radius} 0 1,1 0,-${2 * radius}`}
                    fill="none"
                  />
                  <text fill={task.color} fontSize={`${(clockSize / 520) * 11}px`} fontWeight="600" opacity="0.9">
                    <textPath href={`#path-${task.id}`} startOffset={textOffset} textAnchor="middle" dominantBaseline="central">
                      {task.name}
                    </textPath>
                  </text>
                </g>
              );
            })}

            {isToday && (
              <circle
                cx={center + radius * Math.sin((handAngle * Math.PI) / 180)}
                cy={center - radius * Math.cos((handAngle * Math.PI) / 180)}
                r={(clockSize / 520) * 5} fill="white" opacity="0.7"
              />
            )}

            <text x={center} y={center - ((clockSize / 520) * 16)} fill="white" fontSize={`${(clockSize / 520) * 52}px`} fontWeight="600"
              textAnchor="middle" dominantBaseline="central" letterSpacing="-1">
              {isToday ? timeString : dayName}
            </text>
            <text x={center} y={center + ((clockSize / 520) * 32)} fill="#fff" fontSize={`${(clockSize / 520) * 16}px`}
              textAnchor="middle" letterSpacing="4px" fontWeight="600">
              {isToday ? dayName : viewedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase()}
            </text>
          </svg>
        </div>

        <div className="add-col">
          <button
            onClick={() => setShowAdd(true)}
            disabled={isSaving}
            style={{
              backgroundColor: "white", color: "black", border: "none",
              padding: "12px 28px", borderRadius: "6px", fontSize: "13px",
              fontWeight: "600", fontFamily: "var(--font-cuprum), sans-serif",
              letterSpacing: "1px", cursor: isSaving ? "wait" : "pointer", textTransform: "uppercase",
              display: "block", marginBottom: "16px", opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "SAVING..." : "+ Add Task"}
          </button>
          <p style={{ fontSize: "12px", color: "#fff", lineHeight: "1.6", maxWidth: "200px", margin: 0 }}>
            Click an arc on the clock to edit or delete a task.
          </p>
        </div>
      </div>

      {showAdd && (
        <TaskForm
          title="New Task"
          onSave={handleAddTask}
          onClose={() => setShowAdd(false)}
          currentKey={currentKey}
        />
      )}

      {editingTask && (
        <TaskForm
          title="Edit Task"
          initial={editingTask}
          onSave={(t) => handleUpdateTask(editingTask.id, t)}
          onDelete={() => handleDeleteTask(editingTask.id)}
          onClose={() => setEditingTask(null)}
          currentKey={currentKey}
        />
      )}

      {showDateSelect && (
        <DateSelector
          onClose={() => setShowDateSelect(false)}
          onSelectDate={(date) => {
            const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const diffTime = selectedDate.getTime() - todayDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            setDayOffset(diffDays);
          }}
        />
      )}
    </div>
  );
};

interface DateSelectorProps {
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onClose, onSelectDate }) => {
  const [dateInput, setDateInput] = useState("");

  const handleConfirm = () => {
    if (dateInput) {
      const [year, month, day] = dateInput.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      onSelectDate(date);
      onClose();
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 28px 0", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>
        Jump to Date
      </h2>

      <div style={{ marginBottom: "24px" }}>
        <ModalLabel>Select date</ModalLabel>
        <ModalInput
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          autoFocus
        />
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "1px solid #fff",
            color: "#fff", padding: "10px 18px",
            borderRadius: "6px", cursor: "pointer",
            fontSize: "13px", fontFamily: "var(--font-cuprum), sans-serif",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!dateInput}
          style={{
            background: "white", border: "none",
            color: "black", padding: "10px 22px",
            borderRadius: "6px", cursor: "pointer",
            fontSize: "13px", fontWeight: "600",
            fontFamily: "var(--font-cuprum), sans-serif",
            letterSpacing: "0.5px",
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

export default function ClockApp() {
  return (
    <ProtectedRoute>
      <ClockAppContent />
    </ProtectedRoute>
  );
}