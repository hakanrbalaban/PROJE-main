/**
 * Simple linear undo/redo stack for editor snapshots.
 */
export type HistoryApi<T> = {
  push: (current: T) => void;
  undo: (current: T) => T | null;
  redo: (current: T) => T | null;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

export function createHistory<T>(limit = 50): HistoryApi<T> {
  const undoStack: T[] = [];
  const redoStack: T[] = [];

  return {
    push(current: T) {
      undoStack.push(structuredClone(current));
      if (undoStack.length > limit) undoStack.shift();
      redoStack.length = 0;
    },
    undo(current: T) {
      const prev = undoStack.pop();
      if (!prev) return null;
      redoStack.push(structuredClone(current));
      return prev;
    },
    redo(current: T) {
      const next = redoStack.pop();
      if (!next) return null;
      undoStack.push(structuredClone(current));
      return next;
    },
    clear() {
      undoStack.length = 0;
      redoStack.length = 0;
    },
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
  };
}

export type BoardHistoryState = {
  shapes: import("./types").BoardShape[];
  strokes: import("./types").InkStroke[];
};
