import React from 'react';
import { Link } from 'react-router-dom';
import { useLessonStore } from '../../stores/lessonStore';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '進階',
};

export function LessonCatalog() {
  const { lessons, progress } = useLessonStore();

  const getScore = (id: string) => progress.find(p => p.lessonId === id)?.score;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 4, color: '#1e293b' }}>課程目錄</h2>
      <p style={{ marginBottom: 24, color: '#64748b', fontSize: 14 }}>選擇一門課程開始學習電路分析</p>
      <div style={{ display: 'grid', gap: 16 }}>
        {lessons.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>暫無課程</p>
        )}
        {lessons.map(lesson => {
          const score = getScore(lesson.id);
          return (
            <div key={lesson.id} style={{ padding: 20, border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>{lesson.title}</h3>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: DIFFICULTY_COLOR[lesson.difficulty] + '20', color: DIFFICULTY_COLOR[lesson.difficulty], fontWeight: 600 }}>
                    {DIFFICULTY_LABEL[lesson.difficulty]}
                  </span>
                  {score !== undefined && (
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, background: '#dbeafe', color: '#2563eb', fontWeight: 600 }}>
                      ✓ {score}分
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 13, color: '#64748b' }}>{lesson.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>⏱ {lesson.estimatedMinutes} 分鐘</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>📝 {lesson.steps.length} 步驟</span>
                  {lesson.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: '1px 6px', background: '#f1f5f9', color: '#64748b', borderRadius: 4 }}>{tag}</span>
                  ))}
                </div>
              </div>
              <Link
                to={`/lessons/${lesson.id}`}
                style={{ padding: '8px 20px', background: '#2563eb', color: 'white', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                {score !== undefined ? '重新學習' : '開始學習'}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
