import { create } from 'zustand'
import type { StudentProgressRecord } from '../types/circuit'
import { readStorage, writeStorage } from '../utils/persistence'

interface ProgressState {
  records: StudentProgressRecord[]
  studentId: string
  loadProgress: (studentId: string) => void
  startLesson: (lessonId: string) => void
  completeStep: (lessonId: string, stepOrder: number) => void
  recordExerciseAttempt: (exerciseId: string, isCorrect: boolean) => void
  getRecordFor: (type: 'lesson' | 'exercise', targetId: string) => StudentProgressRecord | undefined
}

function storageKey(studentId: string) {
  return `progress::${studentId}`
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  records: [],
  studentId: 'anonymous',

  loadProgress(studentId) {
    const records = readStorage<StudentProgressRecord[]>(storageKey(studentId)) ?? []
    set({ records, studentId })
  },

  startLesson(lessonId) {
    const { records, studentId } = get()
    const existing = records.find((r) => r.type === 'lesson' && r.targetId === lessonId)
    let updated: StudentProgressRecord[]
    if (existing) {
      updated = records.map((r) =>
        r === existing
          ? { ...r, status: r.status === 'not-started' ? 'in-progress' : r.status, lastUpdatedAt: Date.now() }
          : r
      )
    } else {
      const record: StudentProgressRecord = {
        id: `${studentId}::lesson::${lessonId}`,
        studentId,
        type: 'lesson',
        targetId: lessonId,
        status: 'in-progress',
        completedSteps: [],
        startedAt: Date.now(),
        lastUpdatedAt: Date.now(),
      }
      updated = [...records, record]
    }
    set({ records: updated })
    writeStorage(storageKey(studentId), updated)
  },

  completeStep(lessonId, stepOrder) {
    const { records, studentId } = get()
    const existing = records.find((r) => r.type === 'lesson' && r.targetId === lessonId)
    if (!existing) return
    const completedSteps = [...new Set([...(existing.completedSteps ?? []), stepOrder])]
    const updated = records.map((r) =>
      r === existing ? { ...r, completedSteps, lastUpdatedAt: Date.now() } : r
    )
    set({ records: updated })
    writeStorage(storageKey(studentId), updated)
  },

  recordExerciseAttempt(exerciseId, isCorrect) {
    const { records, studentId } = get()
    const existing = records.find((r) => r.type === 'exercise' && r.targetId === exerciseId)
    let updated: StudentProgressRecord[]
    if (existing) {
      const attemptCount = (existing.attemptCount ?? 0) + 1
      updated = records.map((r) =>
        r === existing
          ? {
              ...r,
              attemptCount,
              status: isCorrect ? ('completed' as const) : r.status,
              score: isCorrect ? 100 : r.score,
              completedAt: isCorrect ? Date.now() : r.completedAt,
              lastUpdatedAt: Date.now(),
            }
          : r
      )
    } else {
      const record: StudentProgressRecord = {
        id: `${studentId}::exercise::${exerciseId}`,
        studentId,
        type: 'exercise',
        targetId: exerciseId,
        status: isCorrect ? 'completed' : 'in-progress',
        attemptCount: 1,
        score: isCorrect ? 100 : undefined,
        startedAt: Date.now(),
        completedAt: isCorrect ? Date.now() : undefined,
        lastUpdatedAt: Date.now(),
      }
      updated = [...records, record]
    }
    set({ records: updated })
    writeStorage(storageKey(studentId), updated)
  },

  getRecordFor(type, targetId) {
    return get().records.find((r) => r.type === type && r.targetId === targetId)
  },
}))
