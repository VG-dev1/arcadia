"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type RepeatConfig, type Task } from '@/lib/AuthContext';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

type RepeatUnit = RepeatConfig['unit'];

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
  if (unit === 'weekdays') {
    return target.getDay() % 6 !== 0;
  }
  return false;
};

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

interface ManageCategoriesModalProps {
  onClose: () => void;
  onSelectCategory?: (id: string) => void;
}

interface DateSelectorProps {
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ onClose, onSelectCategory }) => {
  const { categories, addCategory, updateCategory, deleteCategory, allTasks } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingError, setAddingError] = useState('');

  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState('');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const taskCountForCategory = (catId: string): number => {
    return Object.values(allTasks).flat().filter((t) => t.categoryId === catId).length;
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowAddModal(false);
    } catch {
      setAddingError('Could not save category.');
    }
  };

  const handleEdit = async () => {
    if (!editingCat || !editName.trim()) return;
    try {
      await updateCategory(editingCat.id, editName.trim());
      setEditingCat(null);
    } catch {
      alert('Could not update category.');
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    setOpenMenuId(null);
    if (!confirm(`Delete "${catName}"? All tasks in this category will be moved to General.`)) return;
    try {
      await deleteCategory(catId);
    } catch {
      alert('Could not delete category.');
    }
  };

  const btnBase: React.CSSProperties = {
    background: "none", border: "1px solid #fff", color: "#fff",
    padding: "8px 16px", borderRadius: "6px", cursor: "pointer",
    fontSize: "13px", fontFamily: "var(--font-geist-sans), sans-serif", letterSpacing: "0.5px",
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#111", border: "1px solid #fff", borderRadius: "12px",
            padding: "36px", width: "560px", maxWidth: "95vw", height: "520px", maxHeight: "85vh",
            display: "flex", flexDirection: "column",
            color: "white", fontFamily: "var(--font-geist-sans), sans-serif",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", letterSpacing: "0.5px" }}>
              Manage Categories
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "none", border: "1px solid #fff", color: "#fff",
                padding: "8px 16px", borderRadius: "6px", cursor: "pointer",
                fontSize: "12px", fontFamily: "var(--font-geist-sans), sans-serif",
                letterSpacing: "1px", textTransform: "uppercase",
              }}
            >
              + Add Category
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {categories.length === 0 ? (
              <p style={{ color: "#fff", fontSize: "14px" }}>No categories yet.</p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "12px",
              }}>
                {categories.map((cat) => {
                  const count = taskCountForCategory(cat.id);
                  const isMenuOpen = openMenuId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        position: "relative",
                        border: "1px solid #fff",
                        borderRadius: "8px",
                        padding: "16px",
                        cursor: "default",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : cat.id);
                        }}
                        style={{
                          position: "absolute", top: "10px", right: "10px",
                          background: "none", border: "none", color: "#fff",
                          cursor: "pointer", padding: "2px 6px", fontSize: "16px",
                          lineHeight: 1, letterSpacing: "1px",
                        }}
                        title="Options"
                      >
                        ···
                      </button>

                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          style={{
                            position: "absolute", top: "34px", right: "10px",
                            backgroundColor: "#1a1a1a", border: "1px solid #fff",
                            borderRadius: "6px", zIndex: 10, overflow: "hidden",
                            minWidth: "110px",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCat({ id: cat.id, name: cat.name });
                              setEditName(cat.name);
                              setOpenMenuId(null);
                            }}
                            style={{
                              display: "block", width: "100%", textAlign: "left",
                              background: "none", border: "none", color: "#fff",
                              padding: "10px 14px", cursor: "pointer", fontSize: "13px",
                              fontFamily: "var(--font-geist-sans), sans-serif", letterSpacing: "0.5px",
                              borderBottom: "1px solid #333",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            Edit
                          </button>
                          {cat.id !== 'general' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(cat.id, cat.name);
                              }}
                              style={{
                                display: "block", width: "100%", textAlign: "left",
                                background: "none", border: "none", color: "#ef4444",
                                padding: "10px 14px", cursor: "pointer", fontSize: "13px",
                                fontFamily: "var(--font-geist-sans), sans-serif", letterSpacing: "0.5px",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}

                      <p style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: "600", paddingRight: "24px", wordBreak: "break-word" }}>
                        {cat.name}
                      </p>
                      <p style={{ margin: 0, fontSize: "11px", color: "#fff", letterSpacing: "1px", opacity: 0.5 }}>
                        {count} {count === 1 ? "TASK" : "TASKS"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "28px" }}>
            <button
              onClick={onClose}
              style={{
                background: "white", border: "none", color: "black",
                padding: "10px 28px", borderRadius: "6px", cursor: "pointer",
                fontSize: "13px", fontWeight: "600",
                fontFamily: "var(--font-geist-sans), sans-serif", letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111", border: "1px solid #fff", borderRadius: "12px",
              padding: "32px", width: "360px",
              fontFamily: "var(--font-geist-sans), sans-serif", color: "#fff",
            }}
          >
            <h3 style={{ margin: "0 0 24px 0", fontSize: "16px", fontWeight: "600" }}>New Category</h3>
            <div style={{ marginBottom: "24px" }}>
              <ModalLabel>Category name</ModalLabel>
              <ModalInput
                autoFocus
                placeholder="e.g. Work, Study, Health"
                value={newCategoryName}
                onChange={(e) => { setNewCategoryName(e.target.value); setAddingError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              {addingError && <p style={{ color: "#ef4444", fontSize: "12px", margin: "6px 0 0 0" }}>{addingError}</p>}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowAddModal(false); setNewCategoryName(''); }} style={btnBase}>Cancel</button>
              <button
                onClick={handleAdd}
                disabled={!newCategoryName.trim()}
                style={{
                  background: "white", border: "none", color: "black",
                  padding: "8px 20px", borderRadius: "6px", cursor: newCategoryName.trim() ? "pointer" : "not-allowed",
                  fontSize: "13px", fontWeight: "600",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  opacity: newCategoryName.trim() ? 1 : 0.5,
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCat && (
        <div
          onClick={() => setEditingCat(null)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111", border: "1px solid #fff", borderRadius: "12px",
              padding: "32px", width: "360px",
              fontFamily: "var(--font-geist-sans), sans-serif", color: "#fff",
            }}
          >
            <h3 style={{ margin: "0 0 24px 0", fontSize: "16px", fontWeight: "600" }}>Edit Category</h3>
            <div style={{ marginBottom: "24px" }}>
              <ModalLabel>Category name</ModalLabel>
              <ModalInput
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingCat(null)} style={btnBase}>Cancel</button>
              <button
                onClick={handleEdit}
                disabled={!editName.trim()}
                style={{
                  background: "white", border: "none", color: "black",
                  padding: "8px 20px", borderRadius: "6px", cursor: editName.trim() ? "pointer" : "not-allowed",
                  fontSize: "13px", fontWeight: "600",
                  fontFamily: "var(--font-geist-sans), sans-serif",
                  opacity: editName.trim() ? 1 : 0.5,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

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
  currentKey,
}) => {
  const router = useRouter();
  const { categories, addCategory, updateCategory, deleteCategory } = useAuth();

  const [name, setName] = useState(initial?.name ?? "");
  const [startTime, setStartTime] = useState(initial?.start !== undefined ?
    `${String(Math.floor(initial.start / 60)).padStart(2, '0')}:${String(initial.start % 60).padStart(2, '0')}` :
    '08:00');
  const [endTime, setEndTime] = useState(initial?.end !== undefined ?
    `${String(Math.floor(initial.end / 60)).padStart(2, '0')}:${String(initial.end % 60).padStart(2, '0')}` :
    '09:00');
  const [color, setColor] = useState(initial?.color ?? "#ffffff");
  const [useCustom, setUseCustom] = useState(
    initial?.color ? !["#ffffff", "#a3a3a3", "#ef4444", "#f97316", "#eab308", "#22c55e", "#38bdf8", "#818cf8", "#e879f9", "#f43f5e"].includes(initial.color) : false
  );
  const [repeatEnabled, setRepeatEnabled] = useState<boolean>(!!initial?.repeat);
  const [repeatCount, setRepeatCount] = useState<number>(initial?.repeat?.count ?? 1);
  const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>(initial?.repeat?.unit ?? 'days');

  const [selectedCategoryId, setSelectedCategoryId] = useState(initial?.categoryId || 'general');
  const [showManageCategories, setShowManageCategories] = useState(false);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name.trim()) return;
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    if (end <= start) return;

    const repeat: RepeatConfig | undefined = repeatEnabled
      ? { count: Math.max(1, repeatCount), unit: repeatUnit }
      : undefined;

    onSave({
      name: name.trim(),
      start,
      end,
      color,
      categoryId: selectedCategoryId,
      repeat,
      repeatOrigin: initial?.repeatOrigin ?? currentKey,
    });
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

      <div style={{ marginBottom: "20px" }}>
        <ModalLabel>Category</ModalLabel>
        <select
          value={selectedCategoryId}
          onChange={(e) => {
            if (e.target.value === "NEW_CATEGORY_TRIGGER") {
              setShowManageCategories(true);
            } else {
              setSelectedCategoryId(e.target.value);
            }
          }}
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
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="NEW_CATEGORY_TRIGGER" style={{ color: "#818cf8", fontWeight: "600" }}>
            Manage categories...
          </option>
        </select>
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
          {["#ffffff", "#a3a3a3", "#ef4444", "#f97316", "#eab308", "#22c55e", "#38bdf8", "#818cf8", "#e879f9", "#f43f5e"].map((c) => (
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

      <div style={{ marginBottom: "28px" }}>
        <div
          onClick={() => setRepeatEnabled((v) => !v)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            cursor: "pointer", marginBottom: repeatEnabled ? "14px" : "0",
            userSelect: "none",
          }}
        >
          <div style={{
            width: "18px", height: "18px", borderRadius: "4px",
            border: "1px solid #fff", backgroundColor: repeatEnabled ? "#fff" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {repeatEnabled && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4L4 7.5L10 1" stroke="#0B0F1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Repeat
          </span>
        </div>

        {repeatEnabled && (
          <div style={{ display: "grid", gap: "10px" }}>
            <div>
              <ModalLabel>Repeat interval</ModalLabel>
              <select
                value={repeatUnit}
                onChange={(e) => setRepeatUnit(e.target.value as RepeatUnit)}
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
                  appearance: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value="days">Daily</option>
                <option value="weeks">Weekly</option>
                <option value="months">Monthly</option>
                <option value="years">Yearly</option>
                <option value="weekdays">On weekdays</option>
              </select>
            </div>

            {repeatUnit !== "weekdays" && (
              <div>
                <ModalLabel>Every</ModalLabel>
                <input
                  type="number"
                  min={1}
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
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
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        {onDelete ? (
          <button
            onClick={() => { onDelete(); onClose(); }}
            style={{
              background: "none", border: "1px solid #3a1a1a",
              color: "#ef4444", padding: "10px 18px",
              borderRadius: "6px", cursor: "pointer",
              fontSize: "13px", fontFamily: "var(--font-geist-sans), sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            Delete
          </button>
        ) : <span />}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {initial?.id && (
            <button
              onClick={() => {
                const originParam = initial.repeatOrigin ? `&originDate=${initial.repeatOrigin}` : '';
                router.push(`/focus?id=${initial.id}&date=${currentKey}${originParam}`);
              }}
              style={{
                background: "#818cf8", border: "none",
                color: "white", padding: "10px 22px",
                borderRadius: "6px", cursor: "pointer",
                fontSize: "13px", fontWeight: "600",
                fontFamily: "var(--font-geist-sans), sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              Focus
            </button>
          )}
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
            onClick={handleSave}
            disabled={!name || !selectedCategoryId || !startTime || !endTime}
            style={{
              background: "white",
              border: "none",
              color: "black",
              padding: "10px 22px",
              borderRadius: "6px",
              cursor: !name || !selectedCategoryId || !startTime || !endTime ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: "var(--font-geist-sans), sans-serif",
              letterSpacing: "0.5px",
              opacity: !name || !selectedCategoryId || !startTime || !endTime ? 0.5 : 1,
            }}
          >
            Save
          </button>
        </div>
      </div>

      {showManageCategories && (
        <ManageCategoriesModal
          onClose={() => setShowManageCategories(false)}
          onSelectCategory={(id) => { setSelectedCategoryId(id); setShowManageCategories(false); }}
        />
      )}
    </Modal>
  );
};

const DateSelector: React.FC<DateSelectorProps> = ({ onClose, onSelectDate }) => {
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const handleConfirm = () => {
    if (!dateInput) return;
    const [year, month, day] = dateInput.split('-').map(Number);
    onSelectDate(new Date(year, month - 1, day));
    onClose();
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
          disabled={!dateInput}
          style={{
            background: "white",
            border: "none",
            color: "black",
            padding: "10px 22px",
            borderRadius: "6px",
            cursor: dateInput ? "pointer" : "not-allowed",
            fontSize: "13px",
            fontWeight: "600",
            fontFamily: "var(--font-geist-sans), sans-serif",
            letterSpacing: "0.5px",
            opacity: dateInput ? 1 : 0.5,
          }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};

export function ToDoPageContent() {
  const { allTasks, addTask, updateTask, deleteTask } = useAuth();
  const [dayOffset, setDayOffset] = useState(0);
  const [showDateSelect, setShowDateSelect] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date();
  const viewedDate = new Date(today);
  viewedDate.setDate(today.getDate() + dayOffset);
  const currentKey = dateKey(viewedDate);

  const ownTasks: Task[] = allTasks[currentKey] ?? [];
  const repeatingTasks: Task[] = Object.entries(allTasks)
    .filter(([key]) => key !== currentKey)
    .flatMap(([, dayTasks]) =>
      dayTasks.filter((t) => t.repeat && doesTaskRepeatOnDate(t, currentKey))
    );

  const ownIds = new Set(ownTasks.map((t) => t.id));
  const tasks: Task[] = [...ownTasks, ...repeatingTasks.filter((t) => !ownIds.has(t.id))].sort((a, b) => a.start - b.start);

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

  const dayName = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][viewedDate.getDay()];
  const dateLabel = getDateLabel(viewedDate, today);

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
            <p>Although Arcadia encourages the use of the clock wheel, we still provide a to-do list!</p>
            <p style={{ fontSize: "11px", letterSpacing: "2.5px", color: "#fff", textTransform: "uppercase", margin: "0 0 10px 0" }}>
              {dayName}
            </p>
            <p style={{ fontSize: "40px", fontWeight: "600", margin: "0 0 10px 0", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
              {dateLabel}
            </p>
          </div>

          <div className="nav-group" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <button style={navBtnStyle} onClick={() => setDayOffset((o) => o - 1)}>← Prev</button>
            {dayOffset !== 0 && (
              <button style={navBtnStyle} onClick={() => setDayOffset(0)}>Today</button>
            )}
            <button style={navBtnStyle} onClick={() => setDayOffset((o) => o + 1)}>Next →</button>
            <button style={navBtnStyle} onClick={() => setShowDateSelect(true)}>Jump To Date</button>
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
            Click an item on the to-do list to edit or delete a task.
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
                      {task.name} • {task.categoryId} {task.repeat ? <span style={{ fontSize: "10px", letterSpacing: "1px", opacity: 0.5, marginLeft: "8px", fontWeight: "400" }}>↻ REPEATING</span> : null}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#fff", letterSpacing: "0.5px" }}>
                      {`${String(Math.floor(task.start / 60)).padStart(2, '0')}:${String(task.start % 60).padStart(2, '0')} – ${String(Math.floor(task.end / 60)).padStart(2, '0')}:${String(task.end % 60).padStart(2, '0')}`}
                    </p>
                  </div>
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
