import { type RefObject, useCallback } from "react";

interface UseMarkdownEditorOptions {
  value: string;
  onChange: (value: string) => void;
  ref: RefObject<HTMLTextAreaElement | null>;
}

export function useMarkdownEditor({ value, onChange, ref }: UseMarkdownEditorOptions) {

  const applyWrapper = useCallback((prefix: string, suffix: string) => {
    const el = ref.current;
    if (!el) return;

    const start    = el.selectionStart;
    const end      = el.selectionEnd;
    const selected = value.slice(start, end);

    // Toggle off if already wrapped
    const before = value.slice(start - prefix.length, start);
    const after  = value.slice(end, end + suffix.length);

    if (before === prefix && after === suffix) {
      const next =
        value.slice(0, start - prefix.length) +
        selected +
        value.slice(end + suffix.length);
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start - prefix.length, end - prefix.length);
      });
      return;
    }

    // Wrap
    const next =
      value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      if (selected.length === 0) {
        const pos = start + prefix.length;
        el.setSelectionRange(pos, pos);
      } else {
        el.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    });
  }, [value, onChange, ref]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;

    switch (e.key.toLowerCase()) {
      case "b":
        e.preventDefault();
        applyWrapper("**", "**");
        break;
      case "i":
        e.preventDefault();
        applyWrapper("*", "*");
        break;
      case "`":
        e.preventDefault();
        applyWrapper("`", "`");
        break;
      case "k":
        e.preventDefault();
        applyWrapper("[", "](url)");
        break;
    }
  }, [applyWrapper]);

  return { handleKeyDown };
}