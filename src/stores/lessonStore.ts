import { create } from 'zustand';
import type { Lesson, StudentProgressRecord } from '../types/circuit';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/persistence';

const PROGRESS_KEY = 'circuit-app-progress';

interface LessonState {
  lessons: Lesson[];
  currentLessonId: string | null;
  currentStepIndex: number;
  progress: StudentProgressRecord[];
  feedback: string | null;
  isCorrect: boolean | null;
  setLessons: (lessons: Lesson[]) => void;
  startLesson: (id: string) => void;
  submitAnswer: (answer: string | number) => boolean;
  nextStep: () => void;
  completeLesson: (score: number) => void;
  resetLesson: () => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  lessons: [],
  currentLessonId: null,
  currentStepIndex: 0,
  progress: loadFromLocalStorage<StudentProgressRecord[]>(PROGRESS_KEY) ?? [],
  feedback: null,
  isCorrect: null,

  setLessons: (lessons) => set({ lessons }),

  startLesson: (id) => set({ currentLessonId: id, currentStepIndex: 0, feedback: null, isCorrect: null }),

  submitAnswer: (answer) => {
    const { lessons, currentLessonId, currentStepIndex } = get();
    const lesson = lessons.find(l => l.id === currentLessonId);
    if (!lesson) return false;
    const step = lesson.steps[currentStepIndex];
    if (!step?.answer) return false;

    let correct = false;
    if (typeof step.answer === 'number') {
      const num = typeof answer === 'string' ? parseFloat(answer) : answer;
      const tolerance = step.tolerance ?? 0.01;
      correct = Math.abs(num - step.answer) <= Math.abs(step.answer * tolerance);
    } else {
      correct = String(answer).trim().toLowerCase() === String(step.answer).trim().toLowerCase();
    }

    set({ isCorrect: correct, feedback: correct ? '正確！' : `不正確。${step.hint ? '提示：' + step.hint : ''}` });
    return correct;
  },

  nextStep: () => {
    const { lessons, currentLessonId, currentStepIndex } = get();
    const lesson = lessons.find(l => l.id === currentLessonId);
    if (!lesson) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < lesson.steps.length) {
      set({ currentStepIndex: nextIndex, feedback: null, isCorrect: null });
    } else {
      get().completeLesson(100);
    }
  },

  completeLesson: (score) => {
    const { currentLessonId, progress } = get();
    if (!currentLessonId) return;
    const record: StudentProgressRecord = {
      lessonId: currentLessonId,
      completedAt: new Date().toISOString(),
      score,
      attempts: 1,
    };
    const newProgress = [
      ...progress.filter(p => p.lessonId !== currentLessonId),
      record,
    ];
    saveToLocalStorage(PROGRESS_KEY, newProgress);
    set({ progress: newProgress, currentLessonId: null });
  },

  resetLesson: () => set({ currentLessonId: null, currentStepIndex: 0, feedback: null, isCorrect: null }),
}));
