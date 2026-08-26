"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { TaskForm, dateKey } from '@/lib/task-components';
import { useRouter } from 'next/navigation';

export default function onboardingScreen3() {
  const router = useRouter();
  const { addTask } = useAuth();
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const todayKey = dateKey(new Date());

  const handleSave = async (task: Omit<import('@/lib/AuthContext').Task, "id">) => {
    setIsSaving(true);
    try {
      await addTask(todayKey, {
        ...task,
        id: crypto.randomUUID(),
        repeatOrigin: task.repeatOrigin ?? todayKey,
      });
      setTaskAdded(true);
    } catch (error) {
      alert('Error adding task: ' + (error as any).message);
    }
    setIsSaving(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: "clamp(32px, 5.5vw, 76px)", textAlign: "center", fontWeight: "600", lineHeight: "1.1", margin: "24px 0 24px 0" }}>
        {taskAdded ? "Congratulations, you added your first task! Proceed to Dashboard and finish the Setup Guide there." : "Let's add your first task"}
      </h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "28px" }}>
        {!taskAdded ? (
          <button
            onClick={() => setShowAddTask(true)}
            className="button buttonPrimary"
          >
            Let's add it!
          </button>
        ) : (
          <button
            onClick={() => router.push('/dashboard')}
            className="button buttonPrimary"
          >
            Continue to Dashboard
          </button>
        )}
      </div>

      {showAddTask && (
        <TaskForm
          title="Add your first task"
          currentKey={todayKey}
          onSave={handleSave}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
}
