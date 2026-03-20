import { useEffect } from 'react'
import { useHistoryStore } from '../stores/historyStore'

export function useKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useHistoryStore()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isCtrl = e.ctrlKey || e.metaKey
      if (!isCtrl) return

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])
}
