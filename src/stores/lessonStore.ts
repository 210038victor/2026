import { create } from 'zustand'
import type { Lesson, StepFeedback } from '../types/circuit'

interface LessonState {
  currentLesson: Lesson | null
  currentStepIndex: number
  feedback: StepFeedback | null
  loadLesson: (lesson: Lesson) => void
  submitAnswer: (answer: string | number) => void
  skipStep: () => void
  clearFeedback: () => void
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentLesson: null,
  currentStepIndex: 0,
  feedback: null,

  loadLesson(lesson) {
    set({ currentLesson: lesson, currentStepIndex: 0, feedback: null })
  },

  submitAnswer(answer) {
    const { currentLesson, currentStepIndex } = get()
    if (!currentLesson) return
    const step = currentLesson.steps[currentStepIndex]
    if (!step) return

    const tolerance = step.tolerance ?? 2

    let isCorrect = false
    if (typeof step.expectedAnswer === 'number' && typeof answer === 'number') {
      const pctDiff = Math.abs((answer - step.expectedAnswer) / (step.expectedAnswer || 1)) * 100
      isCorrect = pctDiff <= tolerance
    } else {
      isCorrect =
        String(answer).trim().toLowerCase() === String(step.expectedAnswer).trim().toLowerCase()
    }

    const feedback: StepFeedback = {
      isCorrect,
      isPartiallyCorrect: false,
      message: isCorrect ? '正確！' + step.explanation : '答案不正確，請再試一次。',
      hint: isCorrect ? undefined : step.hint,
    }

    set({ feedback })

    if (isCorrect) {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < currentLesson.steps.length) {
        set({ currentStepIndex: nextIndex, feedback })
      }
    }
  },

  skipStep() {
    const { currentLesson, currentStepIndex } = get()
    if (!currentLesson) return
    const nextIndex = currentStepIndex + 1
    if (nextIndex < currentLesson.steps.length) {
      set({ currentStepIndex: nextIndex, feedback: null })
    }
  },

  clearFeedback() {
    set({ feedback: null })
  },
}))
