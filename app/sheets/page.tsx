"use client";

import React, { useState } from 'react';
import { useAuth, type Category, type RepeatConfig, type Task } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';
import {
  ManageCategoriesModal,
  PRESET_COLORS,
  TaskForm,
  dateKey,
  getTasksForDate,
  minutesToTime,
  timeToMinutes,
} from '@/lib/task-components';

type TooltipColumn = 'color' | 'category' | 'repeat';
type EditableColumn = 'name' | 'start' | 'end';

const PRESET_COLORS_DICT: Record<string, string> = {
  "#ffffff": "White",
  "#a3a3a3": "Gray",
  "#ef4444": "Red",
  "#f97316": "Orange",
  "#eab308": "Yellow",
  "#22c55e": "Green",
  "#38bdf8": "Sky Blue",
  "#818cf8": "Indigo",
  "#e879f9": "Pink",
  "#f43f5e": "Rose",
};

const REPEAT_UNIT_LABELS: Record<RepeatConfig['unit'], string> = {
  days: 'Daily',
  weeks: 'Weekly',
  months: 'Monthly',
  years: 'Yearly',
  weekdays: 'On weekdays',
};

const repeatLabel = (repeat?: RepeatConfig): string => {
  if (!repeat) return '—';
  if (repeat.unit === 'weekdays') return 'On weekdays';
  if (repeat.count === 1) return REPEAT_UNIT_LABELS[repeat.unit];
  return `Every ${repeat.count} ${repeat.unit.slice(0, -1)}${repeat.count > 1 ? 's' : ''}`;
};

const isValidHex = (value: string): boolean =>
  /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value.trim());

const cellInputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#1a1a1a',
  border: '1px solid #fff',
  borderRadius: 6,
  color: '#fff',
  padding: '6px 8px',
  fontSize: 13,
  fontFamily: 'var(--font-geist-sans), sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#1a1a1a',
  border: '1px solid #fff',
  borderRadius: 6,
  color: '#fff',
  padding: '8px 10px',
  fontSize: 13,
  fontFamily: 'var(--font-geist-sans), sans-serif',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  boxSizing: 'border-box',
};

const optionBtnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid #1a1a1a',
  color: '#fff',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: 'var(--font-geist-sans), sans-serif',
};

const tooltipLabelStyle: React.CSSProperties = {
  fontSize: 11,
  marginBottom: 8,
};

interface Anchor {
  top: number;
  left: number;
}

const TooltipShell: React.FC<{
  anchor: Anchor;
  minWidth?: number;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ anchor, minWidth = 240, onClose, children }) => (
  <>
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
      }}
      onClick={onClose}
    />
    <div
      style={{
        position: 'fixed',
        top: anchor.top + 6,
        left: Math.max(8, Math.min(anchor.left, (typeof window !== 'undefined' ? window.innerWidth : 1024) - minWidth - 12)),
        zIndex: 1000,
        backgroundColor: '#111',
        border: '1px solid #fff',
        borderRadius: 8,
        padding: 16,
        minWidth,
        color: '#fff',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
    >
      {children}
    </div>
  </>
);

const ColorTooltip: React.FC<{
  task: Task;
  anchor: Anchor;
  onSave: (color: string) => void;
  onClose: () => void;
}> = ({ task, anchor, onSave, onClose }) => {
  const [draft, setDraft] = useState(task.color);

  const commit = () => {
    let value = draft.trim();
    if (!isValidHex(value)) {
      onClose();
      return;
    }
    if (value.length === 4) {
      value = '#' + value.slice(1).split('').map((c) => c + c).join('');
    }
    onSave(value.toLowerCase());
  };

  return (
    <TooltipShell anchor={anchor} onClose={onClose}>
      <div style={tooltipLabelStyle}>Colour</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onSave(c)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: c,
              border: task.color === c ? '2px solid white' : '2px solid transparent',
              outline: task.color === c ? '1px solid #fff' : 'none',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        placeholder="#38bdf8"
        style={{
          ...cellInputStyle,
          fontFamily: 'monospace',
        }}
      />
    </TooltipShell>
  );
};

const CategoryTooltip: React.FC<{
  task: Task;
  categories: Category[];
  anchor: Anchor;
  onSelect: (categoryId: string) => void;
  onManage: () => void;
  onClose: () => void;
}> = ({ task, categories, anchor, onSelect, onManage, onClose }) => (
  <TooltipShell anchor={anchor} onClose={onClose}>
    <div style={tooltipLabelStyle}>Category</div>
    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={optionBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {cat.name}
          {(task.categoryId ?? 'general') === cat.id ? ' (current)' : ''}
        </button>
      ))}
      <button
        onClick={onManage}
        style={{
          ...optionBtnStyle,
          color: '#80ef08',
          fontWeight: 600,
          borderBottom: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2a2a2a')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        Manage categories...
      </button>
    </div>
  </TooltipShell>
);

const RepeatTooltip: React.FC<{
  task: Task;
  anchor: Anchor;
  onSave: (repeat: RepeatConfig | undefined) => void;
  onClose: () => void;
}> = ({ task, anchor, onSave, onClose }) => {
  const [repeatEnabled, setRepeatEnabled] = useState<boolean>(!!task.repeat);
  const [repeatCount, setRepeatCount] = useState<number>(task.repeat?.count ?? 1);
  const [repeatUnit, setRepeatUnit] = useState<RepeatConfig['unit']>(task.repeat?.unit ?? 'days');

  const handleSave = () => {
    onSave(
      repeatEnabled
        ? { count: Math.max(1, repeatCount), unit: repeatUnit }
        : undefined
    );
  };

  return (
    <TooltipShell anchor={anchor} onClose={onClose}>
      <div
        onClick={() => setRepeatEnabled((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          marginBottom: repeatEnabled ? 12 : 4,
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            border: '1px solid #fff',
            backgroundColor: repeatEnabled ? '#fff' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {repeatEnabled && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4L4 7.5L10 1" stroke="#0B0F1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: 13 }}>Repeat</span>
      </div>

      {repeatEnabled && (
        <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={tooltipLabelStyle}>Repeat interval</div>
            <select
              value={repeatUnit}
              onChange={(e) => setRepeatUnit(e.target.value as RepeatConfig['unit'])}
              style={selectStyle}
            >
              <option value="days">Daily</option>
              <option value="weeks">Weekly</option>
              <option value="months">Monthly</option>
              <option value="years">Yearly</option>
              <option value="weekdays">On weekdays</option>
            </select>
          </div>

          {repeatUnit !== 'weekdays' && (
            <div>
              <div style={tooltipLabelStyle}>Every</div>
              <input
                type="number"
                min={1}
                value={repeatCount}
                onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                style={cellInputStyle}
              />
            </div>
          )}
        </div>
      )}

      <button style={{ marginTop: "12px" }} className="buttonPrimary" onClick={handleSave}>
        Save
      </button>
    </TooltipShell>
  );
};

export function SheetsPageContent() {
  const { allTasks, addTask, updateTask, deleteTask, categories } = useAuth();
  const [dayOffset, setDayOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tooltip, setTooltip] = useState<{ taskId: string; column: TooltipColumn; anchor: Anchor } | null>(null);
  const [editingCell, setEditingCell] = useState<{ taskId: string; column: EditableColumn; draft: string } | null>(null);
  const [managingForTask, setManagingForTask] = useState<Task | null>(null);

  const today = new Date();
  const viewedDate = new Date(today);
  viewedDate.setDate(today.getDate() + dayOffset);
  const currentKey = dateKey(viewedDate);

  const tasks = getTasksForDate(allTasks, viewedDate);

  const openAnchor = (event: React.MouseEvent<HTMLElement>): Anchor => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { top: rect.bottom, left: rect.left };
  };

  const handleUpdate = async (task: Task, changes: Partial<Omit<Task, 'id'>>) => {
    const targetKey = task.repeatOrigin ?? currentKey;
    setIsSaving(true);
    try {
      await updateTask(targetKey, task.id, {
        name: task.name,
        start: task.start,
        end: task.end,
        color: task.color,
        categoryId: task.categoryId,
        repeat: task.repeat,
        repeatOrigin: task.repeatOrigin ?? currentKey,
        status: task.status,
        overTime: task.overTime,
        ...changes,
      });
    } catch (error) {
      alert('Error updating task: ' + (error as Error).message);
    }
    setIsSaving(false);
  };

  const handleAddTask = async (task: Omit<Task, 'id'>) => {
    setIsSaving(true);
    try {
      await addTask(currentKey, {
        ...task,
        id: crypto.randomUUID(),
        repeatOrigin: task.repeatOrigin ?? currentKey,
      });
    } catch (error) {
      alert('Error adding task: ' + (error as Error).message);
    }
    setIsSaving(false);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    const existingTask = tasks.find((item) => item.id === id);
    setIsSaving(true);
    try {
      await deleteTask(existingTask?.repeatOrigin ?? currentKey, id);
      setEditingTask(null);
    } catch (error) {
      alert('Error deleting task: ' + (error as Error).message);
    }
    setIsSaving(false);
  };

  const commitTimeCell = (task: Task, column: 'start' | 'end') => {
    if (!editingCell) return;
    const minutes = timeToMinutes(editingCell.draft);
    const valid =
      !!editingCell.draft &&
      !isNaN(minutes) &&
      (column === 'start' ? minutes < task.end : minutes > task.start);
    if (valid) handleUpdate(task, { [column]: minutes });
    setEditingCell(null);
  };

  const commitNameCell = (task: Task) => {
    if (!editingCell) return;
    const value = editingCell.draft.trim();
    if (value) handleUpdate(task, { name: value });
    setEditingCell(null);
  };

  const tooltipTask = tooltip ? tasks.find((t) => t.id === tooltip.taskId) : null;

  return (
    <div
      style={{
        backgroundColor: '#0B0F1A',
        color: 'white',
        fontFamily: 'var(--font-geist-sans), sans-serif',
      }}
    >
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
          max-width: 260px;
        }

        @media (min-width: 768px) {
          .add-col {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
        }
      `}</style>

      <div
        className="nav-group"
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: 10,
        }}
      >
        <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o - 1)}>
          ← Prev
        </button>
        {dayOffset !== 0 && (
          <button className="button buttonSecondary" onClick={() => setDayOffset(0)}>
            Today
          </button>
        )}
        <button className="button buttonSecondary" onClick={() => setDayOffset((o) => o + 1)}>
          Next →
        </button>
      </div>

      <div className="add-col">
        <button
          onClick={() => setShowAdd(true)}
          disabled={isSaving}
          className="button buttonPrimary"
        >
          {isSaving ? 'SAVING...' : '+ Add Task'}
        </button>
        <p>
          Click the edit icon to edit or delete a task. Type into a cell and press Enter to save,
          or click a value to pick from its options.
        </p>
      </div>

      <h2 style={{ margin: '10px 0 16px 16px', fontSize: 20, fontWeight: 600 }}>
        {viewedDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '56px minmax(170px, 1.8fr) minmax(120px, 0.8fr) minmax(120px, 0.8fr) minmax(150px, 1fr) minmax(130px, 0.9fr) minmax(150px, 1fr)',
          border: '1px solid #ddd',
          overflowX: 'auto',
          margin: '0 0 16px 6px',
        }}
      >
        {(['Edit', 'Name', 'Start time', 'End time', 'Colour', 'Category', 'Repeat'] as const).map(
          (label) => (
            <div
              key={label}
              style={{
                padding: '10px 12px',
                fontWeight: 600,
                fontSize: 13,
                background: '#0B0E1A',
                borderRight: '1px solid #ddd',
                borderBottom: '1px solid #ddd',
              }}
            >
              {label}
            </div>
          )
        )}

        {tasks.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '24px 12px',
              fontSize: 13,
              opacity: 0.6,
              borderBottom: '1px solid #ddd',
            }}
          >
            No tasks for this day.
          </div>
        )}

        {tasks.map((task) => {
          const categoryName =
            categories.find((cat) => cat.id === (task.categoryId ?? 'general'))?.name ?? '—';

          return (
            <React.Fragment key={task.id}>
              <div
                style={{
                  padding: '8px 12px',
                  borderRight: '1px solid #ddd',
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => setEditingTask(task)}
                  title="Edit task"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
              </div>

              <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                {editingCell?.taskId === task.id && editingCell.column === 'name' ? (
                  <input
                    autoFocus
                    value={editingCell.draft}
                    onChange={(e) => setEditingCell({ ...editingCell, draft: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && commitNameCell(task)}
                    onBlur={() => setEditingCell(null)}
                    style={cellInputStyle}
                  />
                ) : (
                  <span
                    onClick={() => setEditingCell({ taskId: task.id, column: 'name', draft: task.name })}
                    style={{ cursor: 'text', display: 'block' }}
                  >
                    {task.status.includes('completed') ? (
                      <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{task.name}</span>
                    ) : (
                      task.name
                    )}
                  </span>
                )}
              </div>

              <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                {editingCell?.taskId === task.id && editingCell.column === 'start' ? (
                  <input
                    type="time"
                    autoFocus
                    value={editingCell.draft}
                    onChange={(e) => setEditingCell({ ...editingCell, draft: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && commitTimeCell(task, 'start')}
                    onBlur={() => setEditingCell(null)}
                    style={{ ...cellInputStyle, colorScheme: 'dark' }}
                  />
                ) : (
                  <span
                    onClick={() =>
                      setEditingCell({ taskId: task.id, column: 'start', draft: minutesToTime(task.start) })
                    }
                    style={{ cursor: 'text' }}
                  >
                    {minutesToTime(task.start)}
                  </span>
                )}
              </div>

              <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                {editingCell?.taskId === task.id && editingCell.column === 'end' ? (
                  <input
                    type="time"
                    autoFocus
                    value={editingCell.draft}
                    onChange={(e) => setEditingCell({ ...editingCell, draft: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && commitTimeCell(task, 'end')}
                    onBlur={() => setEditingCell(null)}
                    style={{ ...cellInputStyle, colorScheme: 'dark' }}
                  />
                ) : (
                  <span
                    onClick={() =>
                      setEditingCell({ taskId: task.id, column: 'end', draft: minutesToTime(task.end) })
                    }
                    style={{ cursor: 'text' }}
                  >
                    {minutesToTime(task.end)}
                  </span>
                )}
              </div>

              <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                <span
                  onClick={(e) => setTooltip({ taskId: task.id, column: 'color', anchor: openAnchor(e) })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: task.color,
                      border: '1px solid #555',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, opacity: 0.85 }}>
                    {PRESET_COLORS_DICT[task.color] ?? task.color}
                  </span>
                </span>
              </div>

              <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                <span
                  onClick={(e) => setTooltip({ taskId: task.id, column: 'category', anchor: openAnchor(e) })}
                  style={{ cursor: 'pointer' }}
                >
                  {categoryName}
                </span>
              </div>

              <div style={{ padding: '8px 12px', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                <span
                  onClick={(e) => setTooltip({ taskId: task.id, column: 'repeat', anchor: openAnchor(e) })}
                  style={{ cursor: 'pointer' }}
                >
                  {repeatLabel(task.repeat)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {tooltip && tooltipTask && (
        <>
          {tooltip.column === 'color' && (
            <ColorTooltip
              task={tooltipTask}
              anchor={tooltip.anchor}
              onSave={(color) => {
                handleUpdate(tooltipTask, { color });
                setTooltip(null);
              }}
              onClose={() => setTooltip(null)}
            />
          )}
          {tooltip.column === 'category' && (
            <CategoryTooltip
              task={tooltipTask}
              categories={categories}
              anchor={tooltip.anchor}
              onSelect={(categoryId) => {
                handleUpdate(tooltipTask, { categoryId });
                setTooltip(null);
              }}
              onManage={() => {
                setManagingForTask(tooltipTask);
                setTooltip(null);
              }}
              onClose={() => setTooltip(null)}
            />
          )}
          {tooltip.column === 'repeat' && (
            <RepeatTooltip
              task={tooltipTask}
              anchor={tooltip.anchor}
              onSave={(repeat) => {
                handleUpdate(tooltipTask, { repeat });
                setTooltip(null);
              }}
              onClose={() => setTooltip(null)}
            />
          )}
        </>
      )}

      {managingForTask && (
        <ManageCategoriesModal
          onClose={() => setManagingForTask(null)}
          onSelectCategory={(id) => {
            handleUpdate(managingForTask, { categoryId: id });
            setManagingForTask(null);
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
          onSave={(task) => {
            const targetKey = editingTask.repeatOrigin ?? currentKey;
            setIsSaving(true);
            updateTask(targetKey, editingTask.id, {
              ...task,
              repeatOrigin: editingTask.repeatOrigin ?? currentKey,
            })
              .catch((error: Error) => alert('Error updating task: ' + error.message))
              .finally(() => setIsSaving(false));
          }}
          onDelete={() => handleDeleteTask(editingTask.id)}
          onClose={() => setEditingTask(null)}
          currentKey={currentKey}
        />
      )}
    </div>
  );
}

export default function SheetsPage() {
  return (
    <ProtectedRoute>
      <SheetsPageContent />
    </ProtectedRoute>
  );
}
