import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

interface KeyboardShortcutsOptions {
  onSave?: () => void;
  onExport?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { saveDashboard, canUndo, canRedo, undo, redo } = useAppStore();
  const { onSave, onExport, onShowHelp } = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow undo/redo in text inputs
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
          return; // Let browser handle text undo/redo
        }
        return;
      }

      const metaOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd+S: Save dashboard
      if (metaOrCtrl && e.key === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
        } else {
          try {
            saveDashboard();
          } catch (err) {
            console.warn('Save failed:', err);
          }
        }
      }

      // Cmd+E: Export
      if (metaOrCtrl && e.key === 'e') {
        e.preventDefault();
        onExport?.();
      }

      // Cmd+Z: Undo (already handled by useUndoRedo, but we check here too)
      if (metaOrCtrl && e.key === 'z' && !e.shiftKey) {
        if (canUndo()) {
          e.preventDefault();
          undo();
        }
      }

      // Cmd+Shift+Z: Redo
      if (metaOrCtrl && e.key === 'z' && e.shiftKey) {
        if (canRedo()) {
          e.preventDefault();
          redo();
        }
      }

      // Cmd+?: Show help
      if (metaOrCtrl && e.key === '?') {
        e.preventDefault();
        onShowHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onExport, onShowHelp, saveDashboard, canUndo, canRedo, undo, redo]);

  return {
    shortcuts: {
      '⌘S': 'Save dashboard',
      '⌘E': 'Export',
      '⌘Z': 'Undo',
      '⌘⇧Z': 'Redo',
      '⌘?': 'Show shortcuts',
    },
  };
}

