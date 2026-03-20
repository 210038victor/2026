import { create } from 'zustand'
import type { CanvasAction } from '../types/circuit'

const MAX_HISTORY = 20

interface HistoryState {
  past: CanvasAction[]
  future: CanvasAction[]
  canUndo: boolean
  canRedo: boolean
  execute: (action: CanvasAction) => void
  undo: () => void
  redo: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  execute(action) {
    const { past } = get()
    const newPast = [...past, action].slice(-MAX_HISTORY)
    set({ past: newPast, future: [], canUndo: true, canRedo: false })
  },

  undo() {
    const { past, future } = get()
    if (past.length === 0) return
    const action = past[past.length - 1]
    const newPast = past.slice(0, -1)
    const newFuture = [action, ...future]
    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    })
  },

  redo() {
    const { past, future } = get()
    if (future.length === 0) return
    const action = future[0]
    const newFuture = future.slice(1)
    const newPast = [...past, action].slice(-MAX_HISTORY)
    set({
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    })
  },
}))
