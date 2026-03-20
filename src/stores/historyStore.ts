import { create } from 'zustand';
import type { CanvasAction } from '../types/circuit';

const MAX_HISTORY = 20;

interface HistoryState {
  past: CanvasAction[];
  future: CanvasAction[];
  canUndo: boolean;
  canRedo: boolean;
  pushAction: (action: CanvasAction) => void;
  undo: () => CanvasAction | null;
  redo: () => CanvasAction | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushAction: (action) => {
    const { past } = get();
    const newPast = [...past, action].slice(-MAX_HISTORY);
    set({ past: newPast, future: [], canUndo: newPast.length > 0, canRedo: false });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;
    const action = past[past.length - 1];
    const newPast = past.slice(0, -1);
    const newFuture = [action, ...future];
    set({ past: newPast, future: newFuture, canUndo: newPast.length > 0, canRedo: newFuture.length > 0 });
    return action;
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;
    const action = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, action].slice(-MAX_HISTORY);
    set({ past: newPast, future: newFuture, canUndo: newPast.length > 0, canRedo: newFuture.length > 0 });
    return action;
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
