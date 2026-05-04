import { useCallback, useEffect, useState } from "react";

const KEY = "dtk-obsidian-theme";

/**
 * Toggles the Obsidian high-contrast theme (9.0:1 A11Y Protocol)
 * by adding/removing the `.obsidian` class on <html>. Persists in localStorage.
 */
export const useObsidianTheme = () => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(KEY) === "1";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.classList.add("obsidian");
    else root.classList.remove("obsidian");
    window.localStorage.setItem(KEY, enabled ? "1" : "0");
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);
  return { enabled, toggle };
};
