'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TemplateSummary {
  id: string;
  name: string;
  authorName: string;
  createdAt?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);

  useEffect(() => {
    const templatesQuery = query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(templatesQuery, (snapshot) => {
      const nextTemplates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TemplateSummary, 'id'>),
      }));
      setTemplates(nextTemplates);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0B0F1A', color: 'white', fontFamily: 'var(--font-geist-sans), sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', margin: '0 0 10px 0', color: '#fff' }}>
            Public templates
          </p>
          <h1 style={{ margin: 0, fontSize: '40px', fontWeight: 600, letterSpacing: '-0.5px' }}>
            Shared plans
          </h1>
        </div>

        {templates.length === 0 ? (
          <div style={{ backgroundColor: '#111', border: '1px solid #fff', borderRadius: '12px', padding: '24px' }}>
            <p style={{ margin: 0, color: '#fff' }}>No templates shared yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {templates.map((template) => (
              <Link key={template.id} href={`/templates/${template.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: '#111', border: '1px solid #fff', borderRadius: '12px', padding: '24px', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transition: 'transform 0.2s ease', cursor: 'pointer' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#fff' }}>{template.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
