"use client";

import React, { useState, useEffect } from 'react';
import { useAuth, type Task, type TaskStatus } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import {
  TaskForm,
  DateSelector,
  TaskStatusMenu,
  dateKey,
  getDateLabel,
  getTasksForDate,
} from '@/lib/task-components';

export function ToDoPageContent() {
  const [now, setNow] = useState(new Date());
  const { allTasks, addTask, updateTask, updateTaskStatus, deleteTask } = useAuth();
  const [dayOffset, setDayOffset] = useState(0);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Task | null>(null);

  const today = new Date();
  const viewedDate = new Date(today);
  viewedDate.setDate(today.getDate() + dayOffset);
  const currentKey = dateKey(viewedDate);

  const tasks: Task[] = getTasksForDate(allTasks, viewedDate);

  const currentTime = (now.getHours() * 60) + now.getMinutes();

  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][viewedDate.getDay()];
  const dateLabel = getDateLabel(viewedDate, today);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddTask = async (t: Omit<Task, "id">) => {
    setIsSaving(true);
    try {
      await addTask(currentKey, { ...t, id: crypto.randomUUID(), repeatOrigin: t.repeatOrigin ?? currentKey });
    } catch (error) {
      alert('Error adding task: ' + (error as any).message);
    }
    setIsSaving(false);
  };

  const handleUpdateTask = async (id: string, t: Omit<Task, "id">) => {
    setIsSaving(true);
    try {
      const task = tasks.find((tk) => tk.id === id);
      const targetKey = task?.repeatOrigin ?? currentKey;
      await updateTask(targetKey, id, { ...t, repeatOrigin: task?.repeatOrigin ?? currentKey });
    } catch (error) {
      alert('Error updating task: ' + (error as any).message);
    }
    setIsSaving(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setIsSaving(true);
    try {
      const task = tasks.find((tk) => tk.id === id);
      const targetKey = task?.repeatOrigin ?? currentKey;
      await deleteTask(targetKey, id);
      setEditingTask(null);
    } catch (error) {
      alert('Error deleting task: ' + (error as any).message);
    }
    setIsSaving(false);
  };

  const handleStatusUpdate = async (status: TaskStatus, overTime: number) => {
    if (!editingStatus) return;
    setIsSaving(true);
    try {
      const task = tasks.find((item) => item.id === editingStatus.id);
      if (status === 'completed-late' && overTime > 0) {
        alert(`Notice: You are completing this task ${overTime} minute(s) past its scheduled end time.`);
      }
      await updateTaskStatus(task?.repeatOrigin ?? currentKey, editingStatus.id, status, overTime);
    } catch (error) {
      alert('Error updating task status: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
      setEditingStatus(null);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#0B0F1A", 
      color: "white", 
      fontFamily: "var(--font-geist-sans), sans-serif", 
      padding: "32px 24px", 
      alignItems: "flex-start", 
      justifyContent: "center" 
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

        @media (max-width: 1024px) {
          .nav-group { justify-content: center; }
        }

        @media (min-width: 768px) {
          .add-col {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: "980px", margin: "0 auto" }}>
        <div style={{ display: "grid", gap: "24px", marginBottom: "32px", justifyContent: "center" }}>
          <div>
            <p style={{ fontSize: "13px", color: "#fff", margin: "0 0 10px 0" }}>
              {dayName}
            </p>
            <p style={{ fontSize: "40px", fontWeight: "600", margin: "0 0 10px 0", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
              {dateLabel}
            </p>
          </div>

          <div className="nav-group" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o - 1)}>← Prev</button>
            {dayOffset !== 0 && (
              <button className="button buttonSecondary" onClick={() => setDayOffset(0)}>Today</button>
            )}
            <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o + 1)}>Next →</button>
            <button className="button buttonSecondary" onClick={() => setShowDateSelect(true)}>Jump To Date</button>
          </div>
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
            Click an item on the to-do list to edit or delete a task, or select "Change status".
          </p>
        </div>

        <div style={{ paddingTop: "32px" }}>
          {tasks.length === 0 ? (
            <p style={{ color: "#fff", fontSize: "14px", lineHeight: "1.6" }}>No tasks yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setEditingTask(task)}
                  style={{
                    padding: "16px",
                    border: "1px solid #1a1a1a",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: "4px", minHeight: "32px", backgroundColor: task.color, borderRadius: "2px", opacity: 0.8 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                      {task.status.includes("completed") ? <span style={{ textDecoration: "line-through" }}>{task.name}</span> : task.name} • {task.categoryId} {task.repeat ? <span style={{ fontSize: "10px", letterSpacing: "1px", opacity: 0.5, marginLeft: "8px", fontWeight: "400" }}>↻ REPEATING</span> : null}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#fff", letterSpacing: "0.5px" }}>
                      {`${String(Math.floor(task.start / 60)).padStart(2, '0')}:${String(task.start % 60).padStart(2, '0')} – ${String(Math.floor(task.end / 60)).padStart(2, '0')}:${String(task.end % 60).padStart(2, '0')}`}
                    </p>
                  </div>
                  <button className="buttonSecondary" style={{ marginLeft: "auto"}} onClick={(e) => {e.stopPropagation(); setEditingStatus(task);}}
                  >
                    Change Status
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDateSelect && (
        <DateSelector
          onClose={() => setShowDateSelect(false)}
          onSelectDate={(date) => {
            const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const diffTime = selected.getTime() - base.getTime();
            setDayOffset(Math.round(diffTime / (1000 * 60 * 60 * 24)));
          }}
        />
      )}

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

      {editingStatus && (
        <TaskStatusMenu
          taskEnd={editingStatus.end}
          taskCurrentStatus={editingStatus.status}
          currentTime={currentTime}
          onSelect={handleStatusUpdate}
          onClose={() => setEditingStatus(null)}
        />
      )}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <ToDoPageContent />
    </ProtectedRoute>
  );
}
