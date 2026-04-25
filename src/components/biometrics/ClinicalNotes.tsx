import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface ClinicalNotesProps {
  idSuffix: string;
}

const ClinicalNotes = ({ idSuffix }: ClinicalNotesProps) => {
  const [notes, setNotes] = useState("");
  const id = `clinical-notes-${idSuffix}`;
  return (
    <div className="mt-6 space-y-2">
      <Label htmlFor={id} className="text-base text-foreground">
        Clinical Notes
      </Label>
      <Textarea
        id={id}
        name={id}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="### Wrap client data in triple-hashes ###"
        className="min-h-[120px] text-base border-2 border-primary/40 bg-background"
      />
    </div>
  );
};

export default ClinicalNotes;
