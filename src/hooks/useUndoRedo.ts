import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

export function useUndoRedo() {
  const { undo, redo, canUndo, canRedo } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z or Ctrl+Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      // Cmd+Shift+Z or Ctrl+Shift+Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return {
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
  };
}

