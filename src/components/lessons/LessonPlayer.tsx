import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessonStore } from '../../stores/lessonStore';

export function LessonPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lessons, currentLessonId, currentStepIndex, feedback, isCorrect, startLesson, submitAnswer, nextStep, resetLesson } = useLessonStore();
  const [answer, setAnswer] = useState('');

  const lesson = lessons.find(l => l.id === id);

  useEffect(() => {
    if (id && currentLessonId !== id) {
      startLesson(id);
    }
  }, [id, currentLessonId, startLesson]);

  if (!lesson) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
        <p>找不到課程。</p>
        <button onClick={() => navigate('/lessons')} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          返回課程目錄
        </button>
      </div>
    );
  }

  const step = lesson.steps[currentStepIndex];
  const isLastStep = currentStepIndex === lesson.steps.length - 1;

  const handleSubmit = () => {
    if (step.type === 'quiz') {
      submitAnswer(answer);
    } else {
      nextStep();
    }
  };

  const handleNext = () => {
    setAnswer('');
    nextStep();
    if (isLastStep) {
      navigate('/lessons');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#64748b' }}>
          <span>{lesson.title}</span>
          <span>{currentStepIndex + 1} / {lesson.steps.length}</span>
        </div>
        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
          <div
            style={{ height: '100%', background: '#2563eb', borderRadius: 3, width: `${((currentStepIndex + 1) / lesson.steps.length) * 100}%`, transition: 'width 0.3s' }}
          />
        </div>
      </div>

      {/* Step content */}
      <div style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 12, background: 'white', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
            {step.type === 'instruction' ? '說明' : step.type === 'quiz' ? '測驗' : '模擬'}
          </span>
          <h3 style={{ margin: 0, fontSize: 17, color: '#1e293b' }}>{step.title}</h3>
        </div>
        <p style={{ margin: '0 0 16px', color: '#374151', lineHeight: 1.7, fontSize: 14 }}>{step.content}</p>

        {step.type === 'quiz' && step.question && (
          <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 12 }}>
            <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{step.question}</p>
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isCorrect && handleSubmit()}
              placeholder="輸入答案…"
              disabled={isCorrect === true}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        )}

        {feedback && (
          <div style={{ padding: '10px 14px', borderRadius: 6, background: isCorrect ? '#f0fdf4' : '#fef2f2', color: isCorrect ? '#15803d' : '#dc2626', fontSize: 13, fontWeight: 500 }}>
            {isCorrect ? '✓ ' : '✗ '}{feedback}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => { resetLesson(); navigate('/lessons'); }}
          style={{ padding: '8px 16px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          ← 返回目錄
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {step.type === 'quiz' && !isCorrect && (
            <button
              onClick={handleSubmit}
              style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              提交答案
            </button>
          )}
          {(step.type !== 'quiz' || isCorrect) && (
            <button
              onClick={handleNext}
              style={{ padding: '8px 20px', background: isLastStep ? '#22c55e' : '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              {isLastStep ? '完成課程 🎉' : '下一步 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
