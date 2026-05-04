import { Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useObsidianTheme } from "@/hooks/useObsidianTheme";

/**
 * Header toggle for the A11Y Hardening Obsidian theme (9.0:1 contrast).
 * Designed for Canvas LMS deployments to bypass false-positive contrast flags.
 */
const ObsidianToggle = () => {
  const { enabled, toggle } = useObsidianTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "Disable Obsidian high-contrast theme"
          : "Enable Obsidian high-contrast theme (9 to 1 protocol)"
      }
      title="A11Y · Obsidian 9:1"
      className="h-8 w-8 text-foreground"
    >
      <Contrast className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
};

export default ObsidianToggle;
