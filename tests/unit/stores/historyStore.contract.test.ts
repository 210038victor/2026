import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from '../../../src/stores/historyStore'
import type { CanvasAction } from '../../../src/types/circuit'

function makeAction(type: CanvasAction['type']): CanvasAction {
  return { type, payload: {}, timestamp: Date.now() }
}

describe('historyStore contract', () => {
  beforeEach(() => {
    useHistoryStore.setState({ past: [], future: [], canUndo: false, canRedo: false })
  })

  it('starts with empty history', () => {
    const { past, future, canUndo, canRedo } = useHistoryStore.getState()
    expect(past).toHaveLength(0)
    expect(future).toHaveLength(0)
    expect(canUndo).toBe(false)
    expect(canRedo).toBe(false)
  })

  it('execute adds action to past', () => {
    useHistoryStore.getState().execute(makeAction('add-component'))
    expect(useHistoryStore.getState().past).toHaveLength(1)
    expect(useHistoryStore.getState().canUndo).toBe(true)
  })

  it('execute clears future', () => {
    useHistoryStore.getState().execute(makeAction('add-component'))
    useHistoryStore.getState().undo()
    expect(useHistoryStore.getState().canRedo).toBe(true)
    useHistoryStore.getState().execute(makeAction('add-wire'))
    expect(useHistoryStore.getState().future).toHaveLength(0)
    expect(useHistoryStore.getState().canRedo).toBe(false)
  })

  it('undo moves action from past to future', () => {
    useHistoryStore.getState().execute(makeAction('add-component'))
    useHistoryStore.getState().undo()
    expect(useHistoryStore.getState().past).toHaveLength(0)
    expect(useHistoryStore.getState().future).toHaveLength(1)
    expect(useHistoryStore.getState().canUndo).toBe(false)
    expect(useHistoryStore.getState().canRedo).toBe(true)
  })

  it('redo moves action from future to past', () => {
    useHistoryStore.getState().execute(makeAction('add-component'))
    useHistoryStore.getState().undo()
    useHistoryStore.getState().redo()
    expect(useHistoryStore.getState().past).toHaveLength(1)
    expect(useHistoryStore.getState().future).toHaveLength(0)
  })

  it('limits past to 20 actions', () => {
    for (let i = 0; i < 25; i++) {
      useHistoryStore.getState().execute(makeAction('add-component'))
    }
    expect(useHistoryStore.getState().past).toHaveLength(20)
  })

  it('undo does nothing when no history', () => {
    useHistoryStore.getState().undo()
    expect(useHistoryStore.getState().past).toHaveLength(0)
  })

  it('redo does nothing when no future', () => {
    useHistoryStore.getState().redo()
    expect(useHistoryStore.getState().future).toHaveLength(0)
  })
})
