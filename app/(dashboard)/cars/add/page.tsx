"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styles from "./Add.module.css";
import { DatePicker } from "@/components/shared/datepicker";
import { SelectDropdown } from "@/components/shared/selectdropdown";
import { CheckboxDropdown } from "@/components/shared/checkboxdropdown";
import { VehicleFormData } from "@/types/Vehicle";
import { getAllTemplates } from "@/lib/api/templateActions";
import { createVehicle } from "@/lib/api/vehicleAction";
import { PreparationTemplate } from "@/types/PreparationTemplate";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddVehicle = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState<boolean>(false);
  const [templates, setTemplates] = useState<PreparationTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [selectedChecklistItems, setSelectedChecklistItems] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("in-prep");
  const [soldPrice, setSoldPrice] = useState<string>("");

  // Validation errors state
  const [errors, setErrors] = useState<{
    registration_no?: string;
    title?: string;
    mileage?: string;
    purchasePrice?: string;
    targetRetail?: string;
    dueDate?: string;
    soldPrice?: string;
  }>({});

  const [formData, setFormData] = useState<VehicleFormData>({
    registration_no: "",
    title: "",
    mileage: "",
    purchasePrice: "",
    targetRetail: "",
    dueDate: undefined,
    instructions: "",
    templateId: "",
    checklistItems: [],
  });

  const onChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch templates on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setTemplatesLoading(true);
        const res = await getAllTemplates();
        setTemplates(res?.data || []);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast.error("Failed to load templates.");
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.registration_no.trim()) {
      newErrors.registration_no = "Registration number is required";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Vehicle title is required";
    }

    const mileageNum = Number(formData.mileage);
    if (!formData.mileage || isNaN(mileageNum) || mileageNum < 0) {
      newErrors.mileage = "Mileage must be a positive number";
    }

    const purchaseNum = Number(formData.purchasePrice);
    if (!formData.purchasePrice || isNaN(purchaseNum) || purchaseNum < 0) {
      newErrors.purchasePrice = "Purchase price must be a positive number";
    }

    const retailNum = Number(formData.targetRetail);
    if (!formData.targetRetail || isNaN(retailNum) || retailNum < 0) {
      newErrors.targetRetail = "Target retail price must be a positive number";
    } else if (purchaseNum && retailNum <= purchaseNum) {
      newErrors.targetRetail = "Target retail must be greater than purchase price";
    }

    if (!date) {
      newErrors.dueDate = "Due date is required";
    }

    if (status === "sold") {
      const soldNum = Number(soldPrice);
      if (!soldPrice || isNaN(soldNum) || soldNum < 0) {
        newErrors.soldPrice = "Sold price must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the validation errors.");
      return;
    }

    try {
      setLoading(true);

      const vehiclePayload = {
        registration_no: formData.registration_no.toUpperCase(),
        title: formData.title,
        mileage: Number(formData.mileage),
        purchasePrice: Number(formData.purchasePrice),
        targetRetail: Number(formData.targetRetail),
        dueDate: date,
        instructions: formData.instructions,
        status: status,
        isSold: status === "sold",
        soldPrice: status === "sold" ? Number(soldPrice) : undefined,
      };

      const selectedTemplate = templates.find((t) => t._id === selectedTemplateId);

      const checkListPayload = {
        templateId: selectedTemplateId,
        items: selectedTemplate
          ? selectedTemplate.checklist
            .filter((item) => selectedChecklistItems.includes(item.title))
            .map((item) => ({
              title: item.title,
              order: item.order,
              isCompleted: false,
            }))
          : [],
      };

      await createVehicle({ vehicle: vehiclePayload, checkList: checkListPayload });

      toast.success("Vehicle created successfully!");
      router.push("/cars");
    } catch (error: unknown) {
      console.error("Failed to create vehicle:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to create vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 flex flex-col gap-8 px-12 max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/cars")}
          className="rounded-full hover:bg-zinc-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-3xl">Add Vehicle</h1>
      </div>

      <form onSubmit={handleSubmit} className="">
        <FieldGroup className="grid md:grid-cols-2 items-start justify-center gap-x-12 gap-y-6">
          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>
              Registration Number <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              name="registration_no"
              id="reg"
              type="text"
              placeholder="e.g. AB12 CDE"
              className={`${styles.inputField} ${errors.registration_no ? "border-rose-500" : ""}`}
              value={formData.registration_no}
              onChange={(e) => {
                onChangeForm(e);
                if (errors.registration_no) setErrors(prev => ({ ...prev, registration_no: undefined }));
              }}
            />
            {errors.registration_no && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.registration_no}
              </span>
            )}
          </Field>

          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>
              Vehicle Title <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="title"
              type="text"
              placeholder="e.g. Volkswagen Golf GTD 2021"
              className={`${styles.inputField} ${errors.title ? "border-rose-500" : ""}`}
              name="title"
              value={formData.title}
              onChange={(e) => {
                onChangeForm(e);
                if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
              }}
            />
            {errors.title && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.title}
              </span>
            )}
          </Field>

          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>
              Mileage <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="mileage"
              type="number"
              placeholder="e.g. 45000"
              className={`${styles.inputField} ${errors.mileage ? "border-rose-500" : ""}`}
              name="mileage"
              value={formData.mileage}
              onChange={(e) => {
                onChangeForm(e);
                if (errors.mileage) setErrors(prev => ({ ...prev, mileage: undefined }));
              }}
            />
            {errors.mileage && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.mileage}
              </span>
            )}
          </Field>

          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>
              Purchase Price <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="purchasePrice"
              type="number"
              placeholder="Purchase Price &#163;"
              className={`${styles.inputField} ${errors.purchasePrice ? "border-rose-500" : ""}`}
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={(e) => {
                onChangeForm(e);
                if (errors.purchasePrice) setErrors(prev => ({ ...prev, purchasePrice: undefined }));
              }}
            />
            {errors.purchasePrice && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.purchasePrice}
              </span>
            )}
          </Field>

          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>
              Target Retail Price <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="retailprice"
              type="number"
              placeholder="Target Retail &#163;"
              className={`${styles.inputField} ${errors.targetRetail ? "border-rose-500" : ""}`}
              name="targetRetail"
              value={formData.targetRetail}
              onChange={(e) => {
                onChangeForm(e);
                if (errors.targetRetail) setErrors(prev => ({ ...prev, targetRetail: undefined }));
              }}
            />
            {errors.targetRetail && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.targetRetail}
              </span>
            )}
          </Field>

          <Field className={styles.fieldContainer}>
            <FieldLabel className={styles.fieldLabel}>
              Vehicle Status <span className="text-destructive">*</span>
            </FieldLabel>
            <Select onValueChange={(val) => setStatus(val)} value={status}>
              <SelectTrigger className={styles.inputField}>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="in-prep">In Preparation</SelectItem>
                <SelectItem value="ready">Ready for Sale</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {status === "sold" && (
            <Field className={styles.fieldContainer}>
              <FieldLabel className={styles.fieldLabel}>
                Sold Price <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="soldPrice"
                type="number"
                placeholder="Sold Price &#163;"
                className={`${styles.inputField} ${errors.soldPrice ? "border-rose-500" : ""}`}
                value={soldPrice}
                onChange={(e) => {
                  setSoldPrice(e.target.value);
                  if (errors.soldPrice) setErrors(prev => ({ ...prev, soldPrice: undefined }));
                }}
              />
              {errors.soldPrice && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.soldPrice}
                </span>
              )}
            </Field>
          )}

          <div className="flex flex-col">
            <FieldLabel htmlFor="date-picker-optional" className={styles.fieldLabel}>Due Date</FieldLabel>
            <DatePicker
              open={open}
              setOpen={setOpen}
              date={date}
              setDate={(d) => {
                setDate(d);
                if (errors.dueDate) setErrors(prev => ({ ...prev, dueDate: undefined }));
              }}
            />
            {errors.dueDate && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.dueDate}
              </span>
            )}
          </div>

          <SelectDropdown
            label="Select Checklist Template (Optional)"
            placeholder="Select Template"
            items={templates}
            getOptionValue={(temp) => temp._id || ""}
            getOptionLabel={(temp) => temp.name}
            onValueChange={(id) => {
              setSelectedTemplateId(id);
              const template = templates.find((t) => t._id === id);
              if (template) {
                setSelectedChecklistItems(template.checklist.map((item) => item.title));
              } else {
                setSelectedChecklistItems([]);
              }
            }}
            value={selectedTemplateId}
            loading={templatesLoading}
          />

          {selectedTemplateId && (
            <CheckboxDropdown
              label="Selected Checklist Items"
              placeholder="Select Checklist Items"
              items={templates.find((t) => t._id === selectedTemplateId)?.checklist || []}
              selectedKeys={selectedChecklistItems}
              getOptionValue={(item) => item.title}
              getOptionLabel={(item) => item.title}
              onCheckedChange={(title, checked) => {
                if (checked) {
                  setSelectedChecklistItems((prev) => [...prev, title]);
                } else {
                  setSelectedChecklistItems((prev) => prev.filter((t) => t !== title));
                }
              }}
            />
          )}

          <div className="md:col-span-2 mt-4">
            <Field className={styles.fieldContainer}>
              <FieldLabel className={styles.fieldLabel}>
                Instructions / Notes / faults
              </FieldLabel>
              <Input
                id="instructions"
                name="instructions"
                type="text"
                placeholder="Instructions / Notes"
                className={styles.inputField}
                value={formData.instructions}
                onChange={onChangeForm}
              />
            </Field>

            <div className={styles.buttonGroup}>
              <Button
                type="button"
                variant="outline"
                className={styles.cancelButton}
                onClick={() => router.push("/cars")}
              >
                Cancel
              </Button>
              <Button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Submitting...
                  </span>
                ) : (
                  "Create Vehicle"
                )}
              </Button>{" "}
            </div>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};

export default AddVehicle;
