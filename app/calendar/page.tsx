"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, type Task, type TaskStatus } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import { DateSelector, TaskForm, TaskStatusMenu } from '@/app/todo/page';

const dateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const doesTaskRepeatOnDate = (task: Task, targetKey: string): boolean => {
  if (!task.repeat || !task.repeatOrigin) return false;
  const origin = new Date(task.repeatOrigin + 'T00:00:00');
  const target = new Date(targetKey + 'T00:00:00');
  if (target < origin) return false;
  const { count, unit } = task.repeat;
  if (unit === 'days') {
    const diff = Math.round((target.getTime() - origin.getTime()) / 86400000);
    return diff % count === 0;
  }
  if (unit === 'weeks') {
    const diff = Math.round((target.getTime() - origin.getTime()) / 86400000);
    return diff % (count * 7) === 0;
  }
  if (unit === 'months') {
    const yearDiff = target.getFullYear() - origin.getFullYear();
    const monthDiff = yearDiff * 12 + (target.getMonth() - origin.getMonth());
    return monthDiff % count === 0 && target.getDate() === origin.getDate();
  }
  if (unit === 'years') {
    const yearDiff = target.getFullYear() - origin.getFullYear();
    return yearDiff % count === 0 && target.getMonth() === origin.getMonth() && target.getDate() === origin.getDate();
  }
  if (unit === 'weekdays') return target.getDay() % 6 !== 0;
  return false;
};

const views = ["weekly", "monthly", "yearly"] as const;
type CalendarView = (typeof views)[number];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
        minWidth: "360px",
        maxWidth: "90vw",
        color: "white",
        fontFamily: "var(--font-geist-sans), sans-serif",
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
      fontFamily: "var(--font-geist-sans), sans-serif",
      outline: "none",
      boxSizing: "border-box",
      ...props.style,
    }}
  />
);

interface JumpMonthModalProps {
  initialYear: number;
  initialMonth: number;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
}

const JumpMonthModal: React.FC<JumpMonthModalProps> = ({ initialYear, initialMonth, onClose, onSelect }) => {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const handleConfirm = () => {
    if (!year) return;
    onSelect(year, month);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 28px 0", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>
        Jump to Month
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <ModalLabel>Month</ModalLabel>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          style={{
            width: "100%",
            backgroundColor: "#1a1a1a",
            border: "1px solid #fff",
            borderRadius: "6px",
            color: "white",
            padding: "10px 12px",
            fontSize: "15px",
            fontFamily: "var(--font-geist-sans), sans-serif",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <ModalLabel>Year</ModalLabel>
        <ModalInput
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          autoFocus
        />
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "1px solid #fff",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "var(--font-geist-sans), sans-serif",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!year}
          style={{
            background: "white",
            border: "none",
            color: "black",
            padding: "10px 22px",
            borderRadius: "6px",
            cursor: year ? "pointer" : "not-allowed",
            fontSize: "13px",
            fontWeight: "600",
            fontFamily: "var(--font-geist-sans), sans-serif",
            letterSpacing: "0.5px",
            opacity: year ? 1 : 0.5,
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

interface JumpYearModalProps {
  initialYear: number;
  onClose: () => void;
  onSelect: (year: number) => void;
}

const JumpYearModal: React.FC<JumpYearModalProps> = ({ initialYear, onClose, onSelect }) => {
  const [year, setYear] = useState(initialYear);

  const handleConfirm = () => {
    if (!year) return;
    onSelect(year);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 28px 0", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>
        Jump to Year
      </h2>

      <div style={{ marginBottom: "24px" }}>
        <ModalLabel>Year</ModalLabel>
        <ModalInput
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          autoFocus
        />
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "1px solid #fff",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "var(--font-geist-sans), sans-serif",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!year}
          style={{
            background: "white",
            border: "none",
            color: "black",
            padding: "10px 22px",
            borderRadius: "6px",
            cursor: year ? "pointer" : "not-allowed",
            fontSize: "13px",
            fontWeight: "600",
            fontFamily: "var(--font-geist-sans), sans-serif",
            letterSpacing: "0.5px",
            opacity: year ? 1 : 0.5,
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

interface CircleSegment {
  key: string;
  label: string;
  outerLabel?: string;
  color: string;
  onClick?: () => void;
  isToday?: boolean;
  isSelected?: boolean;
}

interface CircleHeatmapProps {
  segments: CircleSegment[];
  centerTitle: string;
  centerSubtitle: string;
  clockSize: number;
  longTickIndexes?: number[];
}

const CircleHeatmap: React.FC<CircleHeatmapProps> = ({
  segments,
  centerTitle,
  centerSubtitle,
  clockSize,
  longTickIndexes = [0],
}) => {
  const center = clockSize / 2;
  const radius = (clockSize / 2) * 0.73;
  const circumference = 2 * Math.PI * radius;
  const arcWidth = (clockSize / 520) * 34;
  const scale = clockSize / 520;
  const n = segments.length;
  const gap = scale * 4;
  const arcLen = circumference / n - gap;
  const longTicks = new Set(longTickIndexes);

  return (
    <svg
      width={clockSize}
      height={clockSize}
      viewBox={`0 0 ${clockSize} ${clockSize}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      {segments.map((seg, i) => {
        const rotDeg = (i / n) * 360 - 90;
        const midAngle = ((i + 0.5) / n) * 360 - 90;
        const rad = (midAngle * Math.PI) / 180;
        const isBright = seg.color === "#38BDF8";

        return (
          <g
            key={seg.key}
            style={{ cursor: seg.onClick ? "pointer" : "default" }}
            onClick={seg.onClick}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={arcWidth}
              strokeOpacity="1"
              strokeDasharray={`${arcLen} ${circumference - arcLen}`}
              transform={`rotate(${rotDeg} ${center} ${center})`}
              style={{ transition: "stroke-opacity 160ms ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.strokeOpacity = "0.7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.strokeOpacity = "1"; }}
            />
            <text
              x={center + radius * Math.cos(rad)}
              y={center + radius * Math.sin(rad)}
              fill={isBright ? "#0B0F1A" : "#fff"}
              fontSize={`${scale * 11}px`}
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
            >
              {seg.label}
            </text>
            {seg.outerLabel && (
              <text
                x={center + (radius + scale * 28) * Math.cos(rad)}
                y={center + (radius + scale * 28) * Math.sin(rad)}
                fill="#fff"
                fontSize={`${scale * 10}px`}
                opacity="0.85"
                textAnchor="middle"
                dominantBaseline="central"
                pointerEvents="none"
              >
                {seg.outerLabel}
              </text>
            )}
            {seg.isToday && (
              <circle
                cx={center + radius * Math.cos(rad)}
                cy={center + radius * Math.sin(rad)}
                r={scale * 5}
                fill="white"
                opacity="0.9"
                pointerEvents="none"
              />
            )}
            {seg.isSelected && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#fff"
                strokeWidth={2}
                strokeOpacity="0.55"
                strokeDasharray={`${arcLen} ${circumference - arcLen}`}
                transform={`rotate(${rotDeg} ${center} ${center})`}
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}

      <text
        x={center}
        y={center - scale * 14}
        fill="white"
        fontSize={`${scale * 46}px`}
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="central"
        letterSpacing="-1"
      >
        {centerTitle}
      </text>
      <text
        x={center}
        y={center + scale * 34}
        fill="#fff"
        fontSize={`${scale * 15}px`}
        textAnchor="middle"
        letterSpacing="4px"
        fontWeight="600"
      >
        {centerSubtitle}
      </text>
    </svg>
  );
};

export function CalendarPageContent() {
  const { allTasks, addTask, updateTask, updateTaskStatus, deleteTask } = useAuth();
  const [dayOffset, setDayOffset] = useState(0);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusContext, setStatusContext] = useState<{ task: Task; top: number; left: number } | null>(null);
  const [view, setView] = useState<CalendarView>("weekly");
  const [clockSize, setClockSize] = useState(520);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) {
          setClockSize(width * 0.85);
        } else if (width < 1024) {
          setClockSize(480);
        } else {
          setClockSize(560);
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const today = new Date();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const viewedDate = new Date(today);
  viewedDate.setDate(today.getDate() + dayOffset); 
  const startOfWeek = new Date(viewedDate);
  startOfWeek.setDate(viewedDate.getDate() - viewedDate.getDay());

  const dates = days.map((_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const tasksForDate = (date: Date): Task[] => {
    const currentKey = dateKey(date);
    const ownTasks = allTasks[currentKey] ?? [];
    const repeatingTasks = Object.entries(allTasks)
      .filter(([key]) => key !== currentKey)
      .flatMap(([, dayTasks]) => dayTasks.filter((task) => task.repeat && doesTaskRepeatOnDate(task, currentKey)));
    const ownIds = new Set(ownTasks.map((task) => task.id));
    return [...ownTasks, ...repeatingTasks.filter((task) => !ownIds.has(task.id))].sort((a, b) => a.start - b.start);
  };

  const getHeatmapColor = (count: number): string => {
    if (count === 0) return '#131828';
    if (count <= 2) return '#1E293B';
    if (count <= 5) return '#1E3A8A';
    if (count <= 8) return '#0369A1';
    if (count <= 12) return '#0D9488';
    return '#38BDF8';
  };

  const taskHeatmapForDate = (date: Date): string => {
    const currentKey = dateKey(date);
    const ownTasks = allTasks[currentKey] ?? [];
    const ownIds = new Set(ownTasks.map((task) => task.id));

    let count = ownTasks.length;

    for (const [key, dayTasks] of Object.entries(allTasks)) {
      if (key === currentKey) continue;

      for (const task of dayTasks) {
        if (task.repeat && !ownIds.has(task.id) && doesTaskRepeatOnDate(task, currentKey)) {
          count++;
          ownIds.add(task.id);
        }
      }
    }

    return getHeatmapColor(count);
  };

  const setDayOffsetFor = (year: number, month: number, day: number) => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const target = new Date(year, month, Math.min(day, lastDay));
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    setDayOffset(Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const monthTaskCount = (year: number, month: number): number => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      total += tasksForDate(new Date(year, month, day)).length;
    }
    return total;
  };

  const handlePrev = () => {
    if (view === "monthly") {
      setDayOffsetFor(viewedDate.getFullYear(), viewedDate.getMonth() - 1, viewedDate.getDate());
    } else if (view === "yearly") {
      setDayOffsetFor(viewedDate.getFullYear() - 1, viewedDate.getMonth(), viewedDate.getDate());
    } else {
      setDayOffset((o) => o - 1);
    }
  };

  const handleNext = () => {
    if (view === "monthly") {
      setDayOffsetFor(viewedDate.getFullYear(), viewedDate.getMonth() + 1, viewedDate.getDate());
    } else if (view === "yearly") {
      setDayOffsetFor(viewedDate.getFullYear() + 1, viewedDate.getMonth(), viewedDate.getDate());
    } else {
      setDayOffset((o) => o + 1);
    }
  };

  const handleJump = () => {
    if (view === "monthly") setShowMonthSelect(true);
    else if (view === "yearly") setShowYearSelect(true);
    else setShowDateSelect(true);
  };

  const daysInMonth = new Date(viewedDate.getFullYear(), viewedDate.getMonth() + 1, 0).getDate();

  const monthSegments: CircleSegment[] = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(viewedDate.getFullYear(), viewedDate.getMonth(), i + 1);
    const key = dateKey(date);
    return {
      key,
      label: String(i + 1),
      outerLabel: date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2),
      color: taskHeatmapForDate(date),
      isToday: key === dateKey(today),
      isSelected: key === dateKey(viewedDate),
      onClick: () => {
        setDayOffsetFor(viewedDate.getFullYear(), viewedDate.getMonth(), i + 1);
        setView("weekly");
      },
    };
  });

  const monthCounts = Array.from({ length: 12 }, (_, i) => monthTaskCount(viewedDate.getFullYear(), i));

  const yearSegments: CircleSegment[] = monthCounts.map((count, i) => ({
    key: `${viewedDate.getFullYear()}-${i}`,
    label: new Date(viewedDate.getFullYear(), i, 1).toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    outerLabel: i % 3 === 0 ? `Q${i / 3 + 1}` : undefined,
    color: getHeatmapColor(count),
    isToday: viewedDate.getFullYear() === today.getFullYear() && i === today.getMonth(),
    isSelected: i === viewedDate.getMonth(),
    onClick: () => {
      setDayOffsetFor(viewedDate.getFullYear(), i, 1);
      setView("monthly");
    },
  }));

  const monthName = viewedDate.toLocaleDateString(undefined, { month: "long" });

  const heading =
    view === "weekly"
      ? `Week of ${startOfWeek.toLocaleDateString()}`
      : view === "monthly"
      ? `${monthName} ${viewedDate.getFullYear()}`
      : String(viewedDate.getFullYear());

  const centerTitle = view === "monthly" ? monthName.toUpperCase() : String(viewedDate.getFullYear());
  const centerSubtitle =
    view === "monthly"
      ? String(viewedDate.getFullYear())
      : `${monthCounts.reduce((a, b) => a + b, 0)} TASKS`;

  const jumpLabel =
    view === "weekly" ? "Jump To Date" : view === "monthly" ? "Jump To Month" : "Jump To Year";

  const handleAddTask = async (task: Omit<Task, "id">) => {
    const currentKey = dateKey(viewedDate);
    setIsSaving(true);
    try {
      await addTask(currentKey, { ...task, id: crypto.randomUUID(), repeatOrigin: task.repeatOrigin ?? currentKey });
    } catch (error) {
      alert('Error adding task: ' + (error as Error).message);
    }
    setIsSaving(false);
  };

  const handleUpdateTask = async (id: string, task: Omit<Task, "id">) => {
    const currentKey = dateKey(viewedDate);
    setIsSaving(true);
    try {
      const existingTask = dates.flatMap((date) => tasksForDate(date)).find((item) => item.id === id);
      const targetKey = existingTask?.repeatOrigin ?? currentKey;
      await updateTask(targetKey, id, { ...task, repeatOrigin: existingTask?.repeatOrigin ?? currentKey });
    } catch (error) {
      alert('Error updating task: ' + (error as Error).message);
    }
    setIsSaving(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const currentKey = dateKey(viewedDate);
    setIsSaving(true);
    try {
      const existingTask = dates.flatMap((date) => tasksForDate(date)).find((item) => item.id === id);
      await deleteTask(existingTask?.repeatOrigin ?? currentKey, id);
      setEditingTask(null);
    } catch (error) {
      alert('Error deleting task: ' + (error as Error).message);
    }
    setIsSaving(false);
  };

  const handleStatusUpdate = async (status: TaskStatus, overTime: number) => {
    if (!statusContext) return;
    setIsSaving(true);
    try {
      const targetKey = statusContext.task.repeatOrigin ?? dateKey(viewedDate);
      if (status === 'completed-late' && overTime > 0) {
        alert(`Notice: You are completing this task ${overTime} minute(s) past its scheduled end time.`);
      }
      await updateTaskStatus(targetKey, statusContext.task.id, status, overTime);
    } catch (error) {
      alert('Error updating task status: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
      setStatusContext(null);
    }
  };

  const navBtnStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid #fff",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "var(--font-geist-sans), sans-serif",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{ 
      backgroundColor: "#0B0F1A", 
      color: "white", 
      fontFamily: "var(--font-geist-sans), sans-serif"
    }}>
      <style>{`
        .add-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          width: fit-content;
          margin: 24px auto 0;
        }

        .add-col p {
          font-size: 12px;
          color: #fff;
          line-height: 1.6;
          margin: 0;
          max-width: 240px;
        }

        @media (min-width: 768px) {
          .add-col {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
        }
      `}</style>

      <div className="nav-group" style={{ display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: "10px" }}>
        <button style={navBtnStyle} onClick={handlePrev}>← Prev</button>
        {dayOffset !== 0 && (
        <button style={navBtnStyle} onClick={() => setDayOffset(0)}>Today</button>
        )}
        <button style={navBtnStyle} onClick={handleNext}>Next →</button>
        <button style={navBtnStyle} onClick={handleJump}>{jumpLabel}</button>
        <div style={{
          display: "flex",
          border: "1px solid #555",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          {views.map((v, idx) => {
            const active = view === v;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  ...navBtnStyle,
                  border: "none",
                  borderRight: idx < views.length - 1 ? "1px solid #fff" : "none",
                  background: active ? "#fff" : "none",
                  color: active ? "#0B0F1A" : "#fff",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="add-col">
        <button
          onClick={() => setShowAdd(true)}
          disabled={isSaving}
          style={{
            backgroundColor: "white",
            color: "black",
            border: "none",
            padding: "12px 28px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            fontFamily: "var(--font-geist-sans), sans-serif",
            letterSpacing: "1px",
            cursor: isSaving ? "wait" : "pointer",
            textTransform: "uppercase",
            opacity: isSaving ? 0.6 : 1,
          }}
        >
            {isSaving ? "SAVING..." : "+ Add Task"}
          </button>
          <p>
            Click an item on the calendar to edit or delete a task, or right click to change the status of it.
          </p>
        </div>

      <h2 style={{ margin: "10px 0 16px 16px", fontSize: 20, fontWeight: 600, marginTop: "10px", textAlign: view === "weekly" ? "left" : "center" }}>
        {heading}
      </h2>

      {view === "weekly" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px repeat(7, minmax(120px, 1fr))",
            border: "1px solid #ddd",
            overflowX: "auto",
            margin: "0 0 16px 6px",
          }}
        >
          <div
            style={{
              borderRight: "1px solid #ddd",
              borderBottom: "1px solid #ddd",
              background: "#0B0E1A",
            }}
          />

          {dates.map((date, i) => {
            const isViewed = date.toDateString() === viewedDate.toDateString();

            return (
              <div
                key={i}
                style={{
                  minHeight: 40,
                  padding: 8,
                  textAlign: "center",
                  fontWeight: 600,
                  borderRight: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                  background: taskHeatmapForDate(date),
                }}
              >
                <div>{days[i]}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: isViewed ? "#818cf8" : "#777",
                    marginTop: 4,
                  }}
                >
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              </div>
            );
          })}

          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div
                style={{
                  height: 60,
                  padding: 8,
                  textAlign: "right",
                  fontSize: 12,
                  color: "#777",
                  background: "#0B0E1A",
                  borderRight: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              >
                {hour}:00
              </div>

              {dates.map((date, day) => (
                <div
                  key={day}
                  style={{
                    position: "relative",
                    height: 60,
                    borderRight: "1px solid #ddd",
                    borderBottom: "1px solid #ddd",
                    boxSizing: "border-box",
                  }}
                >
                  {tasksForDate(date)
                    .filter((task) => Math.floor(task.start / 60) === hour)
                    .map((task) => (
                      <button
                        key={task.id}
                        onClick={() => setEditingTask(task)}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setStatusContext({ task, top: event.clientY, left: event.clientX });
                        }}
                        style={{
                          position: "absolute",
                          top: task.start % 60,
                          left: 4,
                          right: 4,
                          height: task.end - task.start,
                          zIndex: 2,
                          overflow: "hidden",
                          textAlign: "left",
                          padding: "6px 8px",
                          border: "none",
                          borderLeft: `4px solid ${task.color}`,
                          borderRadius: "4px",
                          background: "#1a1a1a",
                          color: "white",
                          cursor: "pointer",
                          fontFamily: "var(--font-geist-sans), sans-serif",
                        }}
                      >
                        <span style={{ display: "block", fontSize: 12, fontWeight: 600 }}>{task.status.includes("completed") ? <span style={{ textDecoration: "line-through" }}>{task.name}</span> : task.name}</span>
                        <span style={{ display: "block", fontSize: 10, opacity: 0.7 }}>
                          {Math.round((task.end - task.start) / 60 * 10) / 10}h{task.repeat ? " · ↻" : ""}
                        </span>
                      </button>
                    ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 40px" }}>
          <CircleHeatmap
            segments={view === "monthly" ? monthSegments : yearSegments}
            centerTitle={centerTitle}
            centerSubtitle={centerSubtitle}
            clockSize={clockSize}
            longTickIndexes={view === "monthly" ? [0] : [0, 3, 6, 9]}
          />
          <p style={{ fontSize: 12, color: "#fff", opacity: 0.8, margin: "16px 0 0 0", letterSpacing: "0.5px" }}>
            {view === "monthly"
              ? "Click a day to open that week in the Weekly view."
              : "Click a month to open it in the Monthly view."}
          </p>
        </div>
      )}

      {showDateSelect && (
        <DateSelector
          onClose={() => setShowDateSelect(false)}
          onSelectDate={(date) => {
            const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            setDayOffset(Math.round((selected.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)));
          }}
        />
      )}

      {showMonthSelect && (
        <JumpMonthModal
          initialYear={viewedDate.getFullYear()}
          initialMonth={viewedDate.getMonth()}
          onClose={() => setShowMonthSelect(false)}
          onSelect={(year, month) => setDayOffsetFor(year, month, viewedDate.getDate())}
        />
      )}

      {showYearSelect && (
        <JumpYearModal
          initialYear={viewedDate.getFullYear()}
          onClose={() => setShowYearSelect(false)}
          onSelect={(year) => setDayOffsetFor(year, viewedDate.getMonth(), viewedDate.getDate())}
        />
      )}

      {showAdd && (
        <TaskForm
          title="New Task"
          onSave={handleAddTask}
          onClose={() => setShowAdd(false)}
          currentKey={dateKey(viewedDate)}
        />
      )}

      {editingTask && (
        <TaskForm
          title="Edit Task"
          initial={editingTask}
          onSave={(task) => handleUpdateTask(editingTask.id, task)}
          onDelete={() => handleDeleteTask(editingTask.id)}
          onClose={() => setEditingTask(null)}
          currentKey={dateKey(viewedDate)}
        />
      )}

      {statusContext && (
        <TaskStatusMenu
          taskEnd={statusContext.task.end}
          taskCurrentStatus={statusContext.task.status}
          currentTime={new Date().getHours() * 60 + new Date().getMinutes()}
          position={{ top: statusContext.top, left: statusContext.left }}
          onSelect={handleStatusUpdate}
          onClose={() => setStatusContext(null)}
        />
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarPageContent />
    </ProtectedRoute>
  );
}
