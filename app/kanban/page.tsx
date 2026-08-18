"use client";

import React, { useState } from 'react';
import { useAuth, type Task, type TaskStatus } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import { DateSelector, TaskForm } from '@/app/todo/page';

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
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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

  const tasksForDate = (date: Date): Task[] => {
    const currentKey = dateKey(date);
    const ownTasks = allTasks[currentKey] ?? [];
    const repeatingTasks = Object.entries(allTasks)
      .filter(([key]) => key !== currentKey)
      .flatMap(([, dayTasks]) => dayTasks.filter((task) => task.repeat && doesTaskRepeatOnDate(task, currentKey)));
    const ownIds = new Set(ownTasks.map((task) => task.id));
    return [...ownTasks, ...repeatingTasks.filter((task) => !ownIds.has(task.id))].sort((a, b) => a.start - b.start);
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

  const handleStatusUpdate = async (task: Task, targetColumnStatus: TaskStatus) => {
    setIsSaving(true);
    try {
      const targetKey = task.repeatOrigin ?? dateKey(viewedDate);
      const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
      const isLate = targetColumnStatus === 'completed' && currentTime > task.end;
      const overTime = isLate ? currentTime - task.end : 0;
      const nextStatus = isLate ? 'completed-late' : targetColumnStatus;

      if (isLate) {
        alert(`Notice: You are completing this task ${overTime} minute(s) past its scheduled end time.`);
      }
      await updateTaskStatus(targetKey, task.id, nextStatus, overTime);
    } catch (error) {
      alert('Error updating task status: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
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

  const columns: { label: string; status: TaskStatus }[] = [
    { label: "To-do", status: "to-do" },
    { label: "In Progress", status: "in-progress" },
    { label: "Completed", status: "completed" },
  ];

  const currentDayTasks = tasksForDate(viewedDate);

  return (
    <div style={{ 
      backgroundColor: "#0B0F1A", 
      color: "white", 
      fontFamily: "var(--font-geist-sans), sans-serif",
      minHeight: "100vh"
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
        <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o - 1)}>← Prev</button>
        {dayOffset !== 0 && (
          <button className="button buttonSecondary" onClick={() => setDayOffset(0)}>Today</button>
        )}
        <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o + 1)}>Next →</button>
        <button className="button buttonSecondary" onClick={() => setShowDateSelect(true)}>Jump To Date</button>
      </div>

      <div className="add-col">
        <button
          onClick={() => setShowAdd(true)}
          disabled={isSaving}
          className="button buttonPrimary"
        >
          {isSaving ? "SAVING..." : "+ Add Task"}
        </button>
        <p>
          Click an item to edit or delete a task, or drag and drop between cards to change its status.
        </p>
      </div>

      <h2 style={{ margin: "20px 0 16px 16px", fontSize: 20, fontWeight: 600 }}>
        Tasks for {viewedDate.toLocaleDateString()}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          padding: "0 16px 16px 16px",
        }}
      >
        {columns.map((col) => {
          const colTasks = currentDayTasks.filter((t) => {
            const status = t.status || "to-do";
            if (col.status === "completed") {
              return status === "completed" || status === "completed-late";
            }
            if (col.status === "to-do") {
              return status === "to-do";
            }
            return status === col.status;
          });

          return (
            <div
              key={col.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggedTaskId) return;
                const task = currentDayTasks.find((t) => t.id === draggedTaskId);
                if (task) {
                  handleStatusUpdate(task, col.status);
                }
                setDraggedTaskId(null);
              }}
              style={{
                background: "#0B0E1A",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, borderBottom: "1px solid #333", paddingBottom: "8px" }}>
                {col.label} ({colTasks.length})
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onClick={() => setEditingTask(task)}
                    style={{
                      padding: "10px 12px",
                      borderLeft: `4px solid ${task.color}`,
                      borderRadius: "4px",
                      background: "#1a1a1a",
                      color: "white",
                      cursor: "grab",
                      fontFamily: "var(--font-geist-sans), sans-serif",
                    }}
                  >
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{task.name}</span>
                    <span style={{ display: "block", fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                      {Math.round(((task.end - task.start) / 60) * 10) / 10}h{task.repeat ? " · ↻" : ""}{task.status === "completed-late" ? " · Late" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
