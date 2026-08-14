"use client";

import React, { useState } from 'react';
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

export function CalendarPageContent() {
  const { allTasks, addTask, updateTask, updateTaskStatus, deleteTask } = useAuth();
  const [dayOffset, setDayOffset] = useState(0);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusContext, setStatusContext] = useState<{ task: Task; top: number; left: number } | null>(null);

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
        <button style={navBtnStyle} onClick={() => setDayOffset((o) => o - 1)}>← Prev</button>
        {dayOffset !== 0 && (
        <button style={navBtnStyle} onClick={() => setDayOffset(0)}>Today</button>
        )}
        <button style={navBtnStyle} onClick={() => setDayOffset((o) => o + 1)}>Next →</button>
        <button style={navBtnStyle} onClick={() => setShowDateSelect(true)}>Jump To Date</button>
        <div style={{
          display: "flex",
          border: "1px solid #555",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <button style={{ ...navBtnStyle, borderRight: "1px solid #fff" }}>
            Weekly
          </button>
          <button style={{ ...navBtnStyle, borderRight: "1px solid #fff" }}>
            Monthly
          </button>
          <button style={navBtnStyle}>
            Yearly
          </button>
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

      <h2 style={{ margin: "10px 0 16px 16px", fontSize: 20, fontWeight: 600, marginTop: "10px" }}>
        Week of {startOfWeek.toLocaleDateString()}
      </h2>

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
