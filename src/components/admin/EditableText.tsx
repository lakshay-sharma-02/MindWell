import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  isAdmin: boolean;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span";
  multiline?: boolean;
}

export function EditableText({
  value,
  onSave,
  isAdmin,
  className = "",
  as: Component = "span",
  multiline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  if (!isAdmin) {
    return <Component className={className}>{value}</Component>;
  }

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      toast({ title: "Saved!", description: "Content updated successfully." });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative inline-flex items-center gap-2 w-full">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`w-full p-2 border border-primary/50 rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
            rows={4}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={`w-full p-1 border border-primary/50 rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
            autoFocus
          />
        )}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="group relative inline-flex items-center gap-2">
      <Component className={className}>{value}</Component>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1 bg-primary/10 text-primary rounded transition-opacity hover:bg-primary/20"
        title="Edit"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </span>
  );
}
