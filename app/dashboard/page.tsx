"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type RepeatConfig, type Task, type TaskStatus } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import { TaskStatusMenu } from '@/app/todo/page';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { setupDevBundler } from 'next/dist/server/lib/router-utils/setup-dev-bundler';
import { TaskForm, Modal, ModalLabel, ModalInput, dateKey, PRESET_COLORS, minutesToTime, timeToMinutes } from '@/lib/task-components';

interface SharedTemplate {
  id: string;
  name: string;
  authorName: string;
  tasks: Task[];
}

interface TemplateTask {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  categoryId?: string;
  repeat?: RepeatConfig;
  repeatOrigin?: string;
}

interface TemplateSnapshot {
  name: string;
  tasks: TemplateTask[];
}

const sanitizeForFirestore = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)).filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      const sanitized = sanitizeForFirestore(entry);
      if (sanitized !== undefined) {
        cleaned[key] = sanitized;
      }
    });
    return cleaned;
  }

  return value;
};

const getStoredTemplate = (): SharedTemplate | null => {
  if (typeof window === 'undefined') return null;

  const storedTemplate = localStorage.getItem('template');
  if (!storedTemplate) return null;

  try {
    const template = JSON.parse(storedTemplate) as SharedTemplate;
    if (!template || typeof template.name !== 'string' || !Array.isArray(template.tasks)) {
      throw new Error('Invalid template');
    }
    return template;
  } catch {
    localStorage.removeItem('template');
    return null;
  }
};

const getDateLabel = (d: Date, today: Date): string => {
  const dk = dateKey(d);
  const todayK = dateKey(today);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (dk === todayK) return "Today";
  if (dk === dateKey(yesterday)) return "Yesterday";
  if (dk === dateKey(tomorrow)) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

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
    return yearDiff % count === 0 &&
      target.getMonth() === origin.getMonth() &&
      target.getDate() === origin.getDate();
  }
  if (unit == 'weekdays') {
    const isWeekday = target.getDay() % 6 !== 0;
    return isWeekday
  }
  return false;
};

const ClockAppContent: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [dayOffset, setDayOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<SharedTemplate | null>(getStoredTemplate);
  const [templateImportDate, setTemplateImportDate] = useState(dateKey(new Date()));
  const [templateImportError, setTemplateImportError] = useState('');
  const [shareTemplateName, setShareTemplateName] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusContext, setStatusContext] = useState<{ task: Task; top: number; left: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [clockSize, setClockSize] = useState(520);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [showDeleteTemplateButton, setShowDeleteTemplateButton] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { allTasks, addTask, updateTask, updateTaskStatus, deleteTask, userProfile, user } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) {
          setClockSize(width * 0.85);
        } else if (width < 1024) {
          setClockSize(500);
        } else {
          setClockSize(600);
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
  const ownTasks: Task[] = allTasks[currentKey] ?? [];

  const repeatingTasks: Task[] = Object.entries(allTasks)
    .filter(([key]) => key !== currentKey)
    .flatMap(([, dayTasks]) =>
      dayTasks.filter(
        (t) => t.repeat && doesTaskRepeatOnDate(t, currentKey)
      )
    );

  const ownIds = new Set(ownTasks.map((t) => t.id));
  const tasks: Task[] = [...ownTasks, ...repeatingTasks.filter((t) => !ownIds.has(t.id))];

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
    if (confirm("Are you sure you want to delete this task?")) {
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
    }
  };

  const handleStatusUpdate = async (status: TaskStatus, overTime: number) => {
    if (!statusContext) return;
    setIsSaving(true);
    try {
      const targetKey = statusContext.task.repeatOrigin ?? currentKey;
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

  const handleShareTemplate = async () => {
    const trimmedName = shareTemplateName.trim();
    if (!trimmedName) return;

    setIsSharing(true);
    setShareError('');

    try {
      const templateId = crypto.randomUUID();
      const templatePayload = sanitizeForFirestore({
        id: templateId,
        name: trimmedName,
        authorName: userProfile?.username || userProfile?.email?.split('@')[0] || 'Anonymous',
        authorId: user?.uid || null,
        dateKey: currentKey,
        tasks: tasks.map((task) => ({ ...task })),
        createdAt: new Date().toISOString(),
      });

      await setDoc(doc(db, 'templates', templateId), templatePayload as Record<string, unknown>);

      setShareLink(`/templates/${templateId}`);
      setShareTemplateName('');
    } catch (error) {
      console.error('Error sharing template:', error);
      setShareError('Could not create a shareable template right now.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdateTemplate = async (): Promise<boolean> => {
    if (!templateId) return false;

    setIsSharing(true);
    setShareError('');

    try {
      const templatePayload = sanitizeForFirestore({
        id: templateId,
        ...(shareTemplateName.trim() && { name: shareTemplateName.trim() }),
        authorName: userProfile?.username || userProfile?.email?.split('@')[0] || 'Anonymous',
        authorId: user?.uid,
        dateKey: currentKey,
        tasks: tasks.map((task) => ({ ...task })),
        updatedAt: new Date().toISOString(),
      });

      await setDoc(
        doc(db, 'templates', templateId),
        templatePayload as Record<string, unknown>,
        { merge: true }
      );

      setShowUpdateButton(false);
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      setShareError('Could not update the template right now.');
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteTemplate = async(): Promise<boolean> => {
    if (!templateId) return false;

    setIsSharing(true);
    setShareError('');

    try {
      await deleteDoc(doc(db, 'templates', templateId));

      setShowDeleteTemplateButton(false);
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      setShareError('Could not delete the template right now');
      return false;
    } finally {
      setIsSharing(false);
    }

  }

  const checkExistingTemplate = async () => {
    setTemplateId(null);
    setShowUpdateButton(false);
    setShowDeleteTemplateButton(false);
    setShareLink('');

    if (!user) return false;

    const templatesQuery = query(
      collection(db, 'templates'),
      where('authorId', '==', user.uid),
      where('dateKey', '==', currentKey)
    );

    const snapshot = await getDocs(templatesQuery);

    if (!snapshot.empty) {
      const existing = snapshot.docs[0];
      const templateData = existing.data() as TemplateSnapshot;

      if (!templateData.name?.trim()) {
        return false;
      }

      setTemplateId(existing.id);

      const hasChanges = compareTemplates(templateData as TemplateSnapshot, tasks);
      setShowUpdateButton(hasChanges);

      setShowDeleteTemplateButton(true);

      setShareLink(`/templates/${existing.id}`);
      return true;
    }

    return false;
  };

  const compareTemplates = (publicTemplate: TemplateSnapshot, tasks: Task[]) => {
    const normalizeTasks = (sourceTasks: Array<TemplateTask | Task>) =>
      sourceTasks
        .map(({ id, name, start, end, color, categoryId, repeat, repeatOrigin }) => ({
          id,
          name,
          start,
          end,
          color,
          ...(categoryId !== undefined && { categoryId }),
          ...(repeat !== undefined && { repeat }),
          ...(repeatOrigin !== undefined && { repeatOrigin }),
        }))
        .sort((a, b) => a.id.localeCompare(b.id));

    return JSON.stringify(normalizeTasks(publicTemplate.tasks)) !== JSON.stringify(normalizeTasks(tasks));
  };

  const closeTemplateImport = () => {
    localStorage.removeItem('template');
    setPendingTemplate(null);
    setTemplateImportError('');
  };

  const handleTemplateImport = async () => {
    if (!pendingTemplate || !templateImportDate || isSaving) return;

    setIsSaving(true);
    setTemplateImportError('');

    try {
      await Promise.all(
        (allTasks[templateImportDate] ?? []).map((task) =>
          deleteTask(templateImportDate, task.id)
        )
      );

      await Promise.all(
        pendingTemplate.tasks.map((task) =>
          addTask(templateImportDate, {
            ...task,
            id: crypto.randomUUID(),
            repeatOrigin: task.repeat ? templateImportDate : undefined,
          })
        )
      );

      const [year, month, day] = templateImportDate.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      setDayOffset(Math.round((selectedDate.getTime() - todayDate.getTime()) / 86400000));
      closeTemplateImport();
    } catch (error) {
      console.error('Error importing template:', error);
      setTemplateImportError('Could not import this template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const center = clockSize / 2;
  const radius = (clockSize / 2) * 0.73;
  const circumference = 2 * Math.PI * radius;
  const arcWidth = (clockSize / 520) * 34;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
    padding: "9px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "var(--font-geist-sans), sans-serif",
    letterSpacing: "0.5px",
  };


  const currentTime = (now.getHours() * 60) + now.getMinutes();
  const currentTask = tasks.find((task) => {return task.start <= currentTime && currentTime <= currentTime});

  return (
    <div style={{
      backgroundColor: "#0B0F1A",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-geist-sans), sans-serif",
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
              fontSize: "13px", color: "#fff", margin: "0 0 10px 0",
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
              <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o - 1)}>← Prev</button>
              {dayOffset !== 0 && (
                <button className="button buttonSecondary" onClick={() => setDayOffset(0)}>Today</button>
              )}
              <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o + 1)}>Next →</button>
              <button className="button buttonSecondary" onClick={() => setShowDateSelect(true)}>Jump To Date</button>
              <button className="button buttonSecondary" onClick={async () => { setShareError(''); if (!await checkExistingTemplate()) setShareLink(''); setShowShareModal(true); }}>Share</button>
            </div>
          </div>
          <p style={{ border: "1px solid #fff", padding: "9px 15px", borderRadius: "6px" }}>{currentTask?.name ? `Current task: ${currentTask?.name}` : "All clear! Sit back and relax!"}</p>
          <div style={{ height: "1px", backgroundColor: "#1a1a1a", marginBottom: "32px" }} />   
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
                <g
                  key={task.id}
                  style={{ cursor: "pointer" }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setStatusContext({ task, top: event.clientY, left: event.clientX });
                  }}
                >
                  <circle
                    cx={center} cy={center} r={radius}
                    fill="none"
                    stroke={task.color}
                    strokeWidth={arcWidth}
                    strokeOpacity="0.35"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    transform={`rotate(${rotDeg} ${center} ${center})`}
                    style={{ transition: "stroke-opacity 160ms ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.strokeOpacity = "0.5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.strokeOpacity = "0.35"; }}
                  />
                  <path
                    id={`path-${task.id}`}
                    d={`M ${center},${center - radius} a ${radius},${radius} 0 1,1 0,${2 * radius} a ${radius},${radius} 0 1,1 0,-${2 * radius}`}
                    fill="none"
                  />
                  <text fill={task.color} fontSize={`${(clockSize / 520) * 11}px`} fontWeight="600" opacity="0.9">
                    <textPath href={`#path-${task.id}`} startOffset={textOffset} textAnchor="middle" dominantBaseline="central">
                      {task.status.includes("completed") ? `${task.name} (completed)` : task.name}
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
              textAnchor="middle" fontWeight="600">
              {isToday ? dayName : viewedDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </text>
          </svg>
        </div>

        <div className="add-col">
          <button
            onClick={() => setShowAdd(true)}
            disabled={isSaving}
            className="button buttonPrimary"
          >
            {isSaving ? "SAVING..." : "+ Add Task"}
          </button>
          <p style={{ fontSize: "12px", color: "#fff", lineHeight: "1.6", maxWidth: "200px", marginTop: 12 }}>
            Click an arc on the clock to edit or delete a task, or right click to change the status of it.
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

      {statusContext && (
        <TaskStatusMenu
          taskEnd={statusContext.task.end}
          taskCurrentStatus={statusContext.task.status}
          currentTime={currentMinutes}
          position={{ top: statusContext.top, left: statusContext.left }}
          onSelect={handleStatusUpdate}
          onClose={() => setStatusContext(null)}
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

      {showShareModal && (
        <Modal onClose={() => { setShowShareModal(false); setShareError(''); setShareLink(''); setShareTemplateName(''); }}>
          <h2 style={{ margin: "0 0 24px 0", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>
            Share Template
          </h2>

          {shareLink ? (
            <>
              <p style={{ margin: "0 0 12px 0", color: "#fff", lineHeight: 1.6 }}>
                Your template is ready. Share this link:
              </p>
              <a href={shareLink} style={{ display: "block", color: "#80ef08", wordBreak: "break-all", marginBottom: "24px" }}>
                {shareLink}
              </a>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                {showDeleteTemplateButton && (
                  <button
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this public template? It will no longer be on the Marketplace.")) {
                        if (!await handleDeleteTemplate()) return;                   
                        setShowShareModal(false);
                        setShareError('');
                        setShareLink('');
                        setShareTemplateName('');
                      }
                    }}
                    disabled={isSharing}
                    style={{ background: "none", border: "1px solid #3a1a1a", color: "#ef4444", padding: "10px 18px", borderRadius: "6px", cursor: isSharing ? "not-allowed" : "pointer", opacity: isSharing ? 0.5 : 1 }}
                    >
                      Delete template
                  </button>
                )}
                {showUpdateButton && (
                  <button
                    onClick={async () => {
                      if (!await handleUpdateTemplate()) return;
                      setShowShareModal(false);
                      setShareError('');
                      setShareLink('');
                      setShareTemplateName('');
                    }}
                    disabled={isSharing}
                    style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: isSharing ? "not-allowed" : "pointer", opacity: isSharing ? 0.5 : 1 }}
                  >
                    {isSharing ? 'Updating...' : 'Update template'}
                  </button>
                )}
                <button
                  onClick={() => { setShowShareModal(false); setShareError(''); setShareLink(''); setShareTemplateName(''); }}
                  style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer" }}
                >
                  Close
                </button>
                <button
                  onClick={() => router.push(shareLink)}
                  style={{ background: "white", border: "none", color: "black", padding: "10px 22px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
                >
                  Open
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: "24px" }}>
                <ModalLabel>Template name</ModalLabel>
                <ModalInput
                  value={shareTemplateName}
                  onChange={(e) => { setShareTemplateName(e.target.value); setShareError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleShareTemplate()}
                  placeholder="e.g. Morning planning"
                  autoFocus
                />
                {shareError && <p style={{ color: "#ef4444", fontSize: "12px", margin: "8px 0 0 0" }}>{shareError}</p>}
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setShowShareModal(false); setShareError(''); setShareLink(''); setShareTemplateName(''); }}
                  style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareTemplate}
                  disabled={!shareTemplateName.trim() || isSharing}
                  style={{ background: "white", border: "none", color: "black", padding: "10px 22px", borderRadius: "6px", cursor: !shareTemplateName.trim() || isSharing ? "not-allowed" : "pointer", fontWeight: 600, opacity: !shareTemplateName.trim() || isSharing ? 0.5 : 1 }}
                >
                  {isSharing ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {pendingTemplate && (
        <Modal onClose={closeTemplateImport}>
          <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>
            Import Template
          </h2>
          <p style={{ margin: "0 0 24px 0", color: "#fff", lineHeight: 1.6 }}>
            You&apos;re about to import {pendingTemplate.name} by {pendingTemplate.authorName || 'Anonymous'}. Select a date to import it to. Existing tasks on that day will be overwritten.
          </p>
          <div style={{ marginBottom: "24px" }}>
            <ModalLabel>Select date</ModalLabel>
            <ModalInput
              type="date"
              value={templateImportDate}
              onChange={(e) => { setTemplateImportDate(e.target.value); setTemplateImportError(''); }}
              autoFocus
            />
            {templateImportError && <p style={{ color: "#ef4444", fontSize: "12px", margin: "8px 0 0 0" }}>{templateImportError}</p>}
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              onClick={closeTemplateImport}
              disabled={isSaving}
              style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 18px", borderRadius: "6px", cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleTemplateImport}
              disabled={!templateImportDate || isSaving}
              style={{ background: "white", border: "none", color: "black", padding: "10px 22px", borderRadius: "6px", cursor: !templateImportDate || isSaving ? "not-allowed" : "pointer", fontWeight: 600, opacity: !templateImportDate || isSaving ? 0.5 : 1 }}
            >
              {isSaving ? 'Importing...' : 'Import'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

interface DateSelectorProps {
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onClose, onSelectDate }) => {
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().split("T")[0]
  );

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
            fontSize: "13px", fontFamily: "var(--font-geist-sans), sans-serif",
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
            fontFamily: "var(--font-geist-sans), sans-serif",
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
