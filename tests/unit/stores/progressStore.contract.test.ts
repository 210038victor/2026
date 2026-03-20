import { describe, it, expect, beforeEach } from 'vitest'
import { useProgressStore } from '../../../src/stores/progressStore'

describe('progressStore contract', () => {
  beforeEach(() => {
    localStorage.clear()
    useProgressStore.getState().loadProgress('test-student')
  })

  it('starts with empty records', () => {
    expect(useProgressStore.getState().records).toHaveLength(0)
  })

  it('startLesson creates in-progress record', () => {
    useProgressStore.getState().startLesson('ohms-law')
    const record = useProgressStore.getState().getRecordFor('lesson', 'ohms-law')
    expect(record).toBeDefined()
    expect(record!.status).toBe('in-progress')
  })

  it('startLesson persists to localStorage', () => {
    useProgressStore.getState().startLesson('kvl')
    const raw = localStorage.getItem('progress::test-student')
    expect(raw).not.toBeNull()
    const records = JSON.parse(raw!)
    expect(records.some((r: { targetId: string }) => r.targetId === 'kvl')).toBe(true)
  })

  it('completeStep adds to completedSteps', () => {
    useProgressStore.getState().startLesson('ohms-law')
    useProgressStore.getState().completeStep('ohms-law', 1)
    const record = useProgressStore.getState().getRecordFor('lesson', 'ohms-law')
    expect(record!.completedSteps).toContain(1)
  })

  it('completeStep does not duplicate steps', () => {
    useProgressStore.getState().startLesson('ohms-law')
    useProgressStore.getState().completeStep('ohms-law', 1)
    useProgressStore.getState().completeStep('ohms-law', 1)
    const record = useProgressStore.getState().getRecordFor('lesson', 'ohms-law')
    expect(record!.completedSteps!.filter((s) => s === 1)).toHaveLength(1)
  })

  it('recordExerciseAttempt increments attemptCount', () => {
    useProgressStore.getState().recordExerciseAttempt('ex1', false)
    const record = useProgressStore.getState().getRecordFor('exercise', 'ex1')
    expect(record!.attemptCount).toBe(1)
  })

  it('recordExerciseAttempt with isCorrect=true sets completed', () => {
    useProgressStore.getState().recordExerciseAttempt('ex1', true)
    const record = useProgressStore.getState().getRecordFor('exercise', 'ex1')
    expect(record!.status).toBe('completed')
  })

  it('getRecordFor returns undefined for unknown id', () => {
    expect(useProgressStore.getState().getRecordFor('lesson', 'unknown')).toBeUndefined()
  })

  it('loadProgress loads from localStorage', () => {
    useProgressStore.getState().startLesson('ohms-law')
    useProgressStore.getState().loadProgress('test-student')
    const record = useProgressStore.getState().getRecordFor('lesson', 'ohms-law')
    expect(record).toBeDefined()
  })
})
