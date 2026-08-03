import { useCallback, useEffect, useRef, useState } from "react";
import { createHistory, type HistoryApi } from "@/lib/history";

/**
 * Undo/redo for a single snapshot value. Call `checkpoint()` before mutating.
 */
export function useHistoryStack<T>(
  getCurrent: () => T,
  apply: (next: T) => void,
  depsKey: string,
  limit = 50,
) {
  const api = useRef<HistoryApi<T>>(createHistory<T>(limit));
  const [, bump] = useState(0);

  useEffect(() => {
    api.current.clear();
    bump((n) => n + 1);
  }, [depsKey]);

  const checkpoint = useCallback(() => {
    api.current.push(getCurrent());
    bump((n) => n + 1);
  }, [getCurrent]);

  const undo = useCallback(() => {
    const prev = api.current.undo(getCurrent());
    if (prev) {
      apply(prev);
      bump((n) => n + 1);
    }
    return prev != null;
  }, [getCurrent, apply]);

  const redo = useCallback(() => {
    const next = api.current.redo(getCurrent());
    if (next) {
      apply(next);
      bump((n) => n + 1);
    }
    return next != null;
  }, [getCurrent, apply]);

  return {
    checkpoint,
    undo,
    redo,
    canUndo: api.current.canUndo(),
    canRedo: api.current.canRedo(),
  };
}
