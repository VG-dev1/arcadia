'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TemplateClockView } from '@/components/TemplateClockView';
import type { Task, TaskStatus } from '@/lib/AuthContext';
import { FieldPath } from 'firebase/firestore';

interface TemplateSummary {
  id: string;
  name: string;
  authorName: string;
  tasks: Task[];
  createdAt?: string;
}

interface FirestoreField {
  stringValue?: string;
  timestampValue?: string;
  integerValue?: string;
  arrayValue?: {
    values?: FirestoreField[];
  };
  mapValue?: {
    fields?: Record<string, FirestoreField>;
  };
}

interface FirestoreQueryResult {
  document?: {
    name: string;
    fields: Record<string, FirestoreField>;
  };
}

const getFieldValue = (field?: FirestoreField) =>
  field?.stringValue ?? field?.timestampValue;

const getTasks = (field?: FirestoreField): Task[] => {
  return (
    field?.arrayValue?.values?.map((item) => {
      const fields = item.mapValue?.fields;

      return {
        id: fields?.id?.stringValue ?? '',
        name: fields?.name?.stringValue ?? '',
        start: Number(fields?.start?.integerValue ?? 0),
        end: Number(fields?.end?.integerValue ?? 0),
        color: fields?.color?.stringValue ?? '#fff',
        categoryId: fields?.categoryId?.stringValue ?? 'general',
        status: (fields?.status?.stringValue ?? 'to-do') as TaskStatus,
        overTime: Number(fields?.overTime?.integerValue ?? 0),
      };
    }) ?? []
  );
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    const loadTemplates = async () => {
      if (!projectId || !apiKey) return;

      try {
        const response = await fetch(
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              structuredQuery: {
                from: [{ collectionId: 'templates' }],
                select: {
                  fields: [
                    { fieldPath: 'name' },
                    { fieldPath: 'authorName' },
                    { fieldPath: 'tasks' },
                    { fieldPath: 'createdAt' },
                  ],
                },
                orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
              },
            }),
          }
        );

        if (!response.ok) throw new Error(`Could not load templates (${response.status})`);

        const results = await response.json() as FirestoreQueryResult[];
        if (controller.signal.aborted) return;

        setTemplates(
          results.flatMap(({ document }) => {
            if (!document) return [];

            const id = document.name.split('/').pop();
            const name = getFieldValue(document.fields.name);
            if (!id || !name) return [];

            return [{
              id,
              name,
              authorName: getFieldValue(document.fields.authorName) ?? 'Anonymous',
              tasks: getTasks(document.fields.tasks),
              createdAt: getFieldValue(document.fields.createdAt),
            }];
          })
        );
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error loading templates:', error);
        }
      }
    };

    loadTemplates();
    return () => controller.abort();
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
                <div style={{ backgroundColor: '#111', border: '1px solid #fff', borderRadius: '12px', padding: '24px', minHeight: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transition: 'transform 0.2s ease', cursor: 'pointer' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#fff' }}>{template.name}</p>
                  <TemplateClockView tasks={template.tasks} size={220}></TemplateClockView>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
