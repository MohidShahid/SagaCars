"use client";
import { FieldLabel, Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import styles from "../../cars/add/Add.module.css";
import { PlusCircle, CheckCircle, AlertCircle, Trash2, ArrowLeft } from "lucide-react";
import { createTemplate } from "@/lib/api/templateActions";
import { checklist } from "@/types/PreparationTemplate";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

const AddTemplate = () => {
  const router = useRouter();
  const [items, setItems] = useState<checklist[]>([]);
  const [checkItem, setCheckItem] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Validation errors state
  const [errors, setErrors] = useState<{
    templateName?: string;
    checklist?: string;
    checkItem?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!templateName.trim()) {
      newErrors.templateName = "Template Name is required";
    }
    if (items.length === 0) {
      newErrors.checklist = "Please add at least one item to the checklist template";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the validation errors.");
      return;
    }
    
    const data = { name: templateName, checklist: items };
    try {
      setLoading(true);
      const res = await createTemplate(data);
      toast.success(res?.message || "Template created successfully!");
      setItems([]);
      setTemplateName("");
      setErrors({});
      router.push("/templates");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create template.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!checkItem.trim()) {
      setErrors(prev => ({ ...prev, checkItem: "Checklist item text cannot be empty" }));
      return;
    }
    
    // Check for duplicate
    if (items.some(item => item.title.toLowerCase() === checkItem.trim().toLowerCase())) {
      setErrors(prev => ({ ...prev, checkItem: "This checklist item already exists" }));
      return;
    }

    setItems((prev) => [
      ...prev,
      { title: checkItem.trim(), order: prev.length + 1 },
    ]);
    setCheckItem("");
    setErrors(prev => ({ ...prev, checkItem: undefined, checklist: undefined }));
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const updatedItems = items
      .filter((_, idx) => idx !== indexToRemove)
      .map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(updatedItems);
  };

  return (
    <div className="py-12 flex flex-col gap-8 px-12 max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/templates")}
          className="rounded-full hover:bg-zinc-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Add Checklist Template</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <FieldGroup className="flex flex-col gap-6">
          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>Template Name</FieldLabel>
            <Input
              type="text"
              placeholder="e.g. Full Mechanical Inspection"
              className={`${styles.inputField} ${errors.templateName ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""}`}
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value);
                if (errors.templateName) setErrors(prev => ({ ...prev, templateName: undefined }));
              }}
            />
            {errors.templateName && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.templateName}
              </span>
            )}
          </Field>

          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>
              Add Custom Checklist Items
            </FieldLabel>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="e.g. Check brake pad wear level"
                  value={checkItem}
                  onChange={(e) => {
                    setCheckItem(e.target.value);
                    if (errors.checkItem) setErrors(prev => ({ ...prev, checkItem: undefined }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  className={`${styles.inputField} w-full ${errors.checkItem ? "border-rose-500" : ""}`}
                />
              </div>
              <Button
                onClick={handleAddItem}
                className={`${styles.submitButton} flex items-center justify-center gap-2 h-12`}
                type="button"
              >
                <PlusCircle className="h-4 w-4" />
                Add Item
              </Button>
            </div>
            {errors.checkItem && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.checkItem}
              </span>
            )}
            {errors.checklist && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.checklist}
              </span>
            )}
          </Field>
        </FieldGroup>
        
        {/* Render checklist items list */}
        {items.length > 0 && (
          <div className="mt-4 border border-zinc-200 rounded-xl bg-zinc-50/50 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Checklist Preview</h3>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {items.map((check, index) => (
                <div 
                  className="flex items-center justify-between gap-4 p-3 bg-white border border-zinc-150 rounded-lg shadow-sm hover:border-zinc-300 transition-colors" 
                  key={index}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-700">{check.title}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-full h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-150">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/templates")}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Creating...
              </span>
            ) : (
              "Create Template"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTemplate;
