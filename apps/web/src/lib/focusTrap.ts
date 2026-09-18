import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const container = ref.current;
    const focusables = Array.from(container?.querySelectorAll(FOCUSABLE) ?? []);
    const first = focusables[0] as HTMLElement | undefined;
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      const nodes = Array.from(container.querySelectorAll(FOCUSABLE)) as HTMLElement[];
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocused.current?.focus();
    };
  }, [active]);

  return ref;
}
