import React from 'react';
import { Link } from 'react-router-dom';
import { useLessonStore } from '../../stores/lessonStore';

export function ProgressDashboard() {
  const { lessons, progress } = useLessonStore();

  if (progress.length === 0) {
    return (
      <div style={{ padding: 24, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ padding: 60, border: '2px dashed #e2e8f0', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h2 style={{ color: '#1e293b', marginBottom: 8 }}>開始您的學習之旅</h2>
          <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>
            您尚未完成任何課程。前往課程目錄開始學習電路分析吧！
          </p>
          <Link
            to="/lessons"
            style={{ display: 'inline-block', padding: '10px 24px', background: '#2563eb', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}
          >
            瀏覽課程
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = progress.length;
  const avgScore = Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 4, color: '#1e293b' }}>學習進度</h2>
      <p style={{ marginBottom: 24, color: '#64748b', fontSize: 14 }}>追蹤您的電路分析學習歷程</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: '已完成課程', value: completedCount, icon: '✅' },
          { label: '平均分數', value: `${avgScore}分`, icon: '⭐' },
          { label: '總課程數', value: lessons.length, icon: '📚' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: 16, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress list */}
      <div style={{ display: 'grid', gap: 10 }}>
        {progress.map(record => {
          const lesson = lessons.find(l => l.id === record.lessonId);
          const date = new Date(record.completedAt).toLocaleDateString('zh-TW');
          return (
            <div key={record.lessonId} style={{ padding: 16, border: '1px solid #e2e8f0', borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✓</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: 15, color: '#1e293b' }}>{lesson?.title ?? record.lessonId}</h4>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>完成日期：{date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: record.score >= 80 ? '#22c55e' : record.score >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {record.score}分
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
