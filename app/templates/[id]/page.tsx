'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TemplateClockView } from '@/components/TemplateClockView';
import type { Task } from '@/lib/AuthContext';

interface SharedTemplate {
  id: string;
  name: string;
  authorName: string;
  tasks: Task[];
  createdAt?: string;
}

export default function SharedTemplatePage() {
  const params = useParams<{ id: string }>();
  const [template, setTemplate] = useState<SharedTemplate | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadTemplate = async () => {
      if (!params?.id) {
        setLoading(false);
        return;
      }

      const templateDoc = await getDoc(doc(db, 'templates', params.id));
      if (templateDoc.exists()) {
        setTemplate({ id: templateDoc.id, ...(templateDoc.data() as Omit<SharedTemplate, 'id'>) });
      }
      setLoading(false);
    };

    loadTemplate();
  }, [params?.id]);

  if (loading) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#0B0F1A', color: 'white', padding: '40px 24px' }}>Loading shared template…</div>;
  }

  if (!template) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0B0F1A', color: 'white', padding: '40px 24px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <p>That template could not be found.</p>
          <Link href="/templates" style={{ color: '#818cf8' }}>Browse all templates</Link>
        </div>
      </div>
    );
  }

  const tasks = template.tasks || [];

  

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B0F1A', color: 'white', fontFamily: 'var(--font-geist-sans), sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 8px 0', color: '#fff' }}>
            Shared template
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 600, letterSpacing: '-0.5px' }}>{template.name}</h1>
              <p style={{ margin: '8px 0 0 0', color: '#9ca3af' }}>by {template.authorName || 'Anonymous'}</p>
            </div>
            <Link href="/templates" style={navBtnStyle}>← Back to templates</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #fff', borderRadius: '16px', padding: '24px' }}>
            <TemplateClockView tasks={tasks}/>
          </div>

          <div style={{ backgroundColor: '#111', border: '1px solid #fff', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>Tasks</h2>
            {tasks.length === 0 ? (
              <p style={{ color: '#fff' }}>No tasks in this template.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {tasks.map((task) => (
                  <div key={task.id} style={{ border: '1px solid #1f2937', borderRadius: '10px', padding: '12px 14px', backgroundColor: '#1a1a1a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: task.color }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>{task.name}</p>
                    </div>
                    <p style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>
                      {`${String(Math.floor(task.start / 60)).padStart(2, '0')}:${String(task.start % 60).padStart(2, '0')} – ${String(Math.floor(task.end / 60)).padStart(2, '0')}:${String(task.end % 60).padStart(2, '0')}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
