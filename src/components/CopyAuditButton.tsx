import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyAuditButtonProps {
  /** Builds the markdown payload at click time so it always reflects current state. */
  getMarkdown: () => string;
  /** Optional: disable when no result is available. */
  disabled?: boolean;
  label?: string;
}

const CopyAuditButton = ({
  getMarkdown,
  disabled = false,
  label = "Copy Audit Summary",
}: CopyAuditButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const md = getMarkdown();
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      toast({
        title: "Audit copied",
        description: "Markdown summary ready for Socratic AI Audit.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Clipboard unavailable in this context.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      variant="outline"
      className="mt-4 w-full h-12 text-base font-semibold border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
      aria-label={label}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
};

export default CopyAuditButton;
