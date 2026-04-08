import { lightImpact } from '@/utils/haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

/** ~0.2s — brief fill before action runs */
export const FLASH_MS = 200;

/** Very transparent primary green */
export const FLASH_GREEN_BG = 'rgba(9, 226, 125, 0.2)';

/**
 * Shows a flash fill for FLASH_MS, then runs the action.
 * Use for non-input primary buttons (selection pills, login rows, etc.).
 */
export function useFlashPress(onAction: () => void) {
  const [flash, setFlash] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePress = useCallback(() => {
    lightImpact();
    setFlash(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setFlash(false);
      onAction();
    }, FLASH_MS);
  }, [onAction]);

  return { flash, handlePress };
}
