"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Car, 
  PlusCircle, 
  Wrench, 
  AlertCircle,
  CheckCircle,
  Edit,
  Sparkles,
  Search,
  Gauge,
  Calendar,
  Circle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVehicles, updateChecklistItem, updateVehicle } from "@/lib/api/vehicleAction";
import { SkeletonCard } from "@/components/shared/skeletonCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { DatePicker } from "@/components/shared/datepicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChecklistItem {
  title: string;
  order: number;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

interface ExpenseItem {
  _id?: string;
  title: string;
  amount: number;
  date?: string;
}

interface VehicleWithChecklist {
  _id: string;
  registration_no: string;
  title: string;
  mileage: number;
  purchasePrice: number;
  targetRetail: number;
  dueDate: string;
  instructions?: string;
  isSold?: boolean;
  soldPrice?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  expenses?: ExpenseItem[];
  checklist?: {
    _id: string;
    vehicleId: string;
    templateId?: string;
    items: ChecklistItem[];
  } | null;
}

const CarsStock = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleWithChecklist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [togglingItem, setTogglingItem] = useState<{ [key: string]: boolean }>({});

  // Editing state
  const [editingVehicle, setEditingVehicle] = useState<VehicleWithChecklist | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState<boolean>(false);

  const [editTitle, setEditTitle] = useState<string>("");
  const [editMileage, setEditMileage] = useState<string>("");
  const [editPurchasePrice, setEditPurchasePrice] = useState<string>("");
  const [editTargetRetail, setEditTargetRetail] = useState<string>("");
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<string>("in-prep");
  const [editSoldPrice, setEditSoldPrice] = useState<string>("");
  const [editInstructions, setEditInstructions] = useState<string>("");
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [editSaving, setEditSaving] = useState<boolean>(false);

  // Editing expenses state
  const [editExpenses, setEditExpenses] = useState<ExpenseItem[]>([]);
  const [newExpenseTitle, setNewExpenseTitle] = useState<string>("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getVehicles();
      setVehicles(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      toast.error("Failed to fetch vehicles stock.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenEdit = (vehicle: VehicleWithChecklist) => {
    setEditingVehicle(vehicle);
    setEditTitle(vehicle.title);
    setEditMileage(String(vehicle.mileage));
    setEditPurchasePrice(String(vehicle.purchasePrice));
    setEditTargetRetail(String(vehicle.targetRetail));
    setEditDueDate(vehicle.dueDate ? new Date(vehicle.dueDate) : undefined);
    setEditStatus(vehicle.status || "in-prep");
    setEditSoldPrice(vehicle.soldPrice ? String(vehicle.soldPrice) : "");
    setEditInstructions(vehicle.instructions || "");
    setEditExpenses(vehicle.expenses || []);
    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setEditErrors({});
    setIsEditOpen(true);
  };

  const handleAddExpense = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newExpenseTitle.trim() || !newExpenseAmount) {
      toast.error("Expense title and amount are required.");
      return;
    }
    const amt = Number(newExpenseAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Expense amount must be a positive number.");
      return;
    }
    setEditExpenses((prev) => [...prev, { title: newExpenseTitle, amount: amt }]);
    setNewExpenseTitle("");
    setNewExpenseAmount("");
  };

  const handleRemoveExpense = (idx: number) => {
    setEditExpenses((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    // Validate
    const newErrors: typeof editErrors = {};
    if (!editTitle.trim()) newErrors.title = "Vehicle title is required";
    
    const mileageNum = Number(editMileage);
    if (!editMileage || isNaN(mileageNum) || mileageNum < 0) {
      newErrors.mileage = "Mileage must be a positive number";
    }

    const purchaseNum = Number(editPurchasePrice);
    if (!editPurchasePrice || isNaN(purchaseNum) || purchaseNum < 0) {
      newErrors.purchasePrice = "Purchase price must be a positive number";
    }

    const retailNum = Number(editTargetRetail);
    if (!editTargetRetail || isNaN(retailNum) || retailNum < 0) {
      newErrors.targetRetail = "Target retail price must be a positive number";
    } else if (purchaseNum && retailNum <= purchaseNum) {
      newErrors.targetRetail = "Target retail must be greater than purchase price";
    }

    if (editStatus === "sold") {
      const soldNum = Number(editSoldPrice);
      if (!editSoldPrice || isNaN(soldNum) || soldNum < 0) {
        newErrors.soldPrice = "Sold price must be a positive number";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      toast.error("Please correct the validation errors.");
      return;
    }

    try {
      setEditSaving(true);
      await updateVehicle(editingVehicle._id, {
        title: editTitle,
        mileage: mileageNum,
        purchasePrice: purchaseNum,
        targetRetail: retailNum,
        dueDate: editDueDate,
        status: editStatus,
        soldPrice: editStatus === "sold" ? Number(editSoldPrice) : undefined,
        instructions: editInstructions,
        expenses: editExpenses
      });

      toast.success("Vehicle updated successfully!");
      setIsEditOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      toast.error("Failed to update vehicle.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleChecklist = async (vehicleId: string, itemTitle: string, currentStatus: boolean) => {
    const key = `${vehicleId}-${itemTitle}`;
    if (togglingItem[key]) return; // Avoid double requests

    // Optimistically update the UI state
    setVehicles((prevVehicles) =>
      prevVehicles.map((veh) => {
        if (veh._id === vehicleId && veh.checklist) {
          const updatedItems = veh.checklist.items.map((item) =>
            item.title === itemTitle ? { ...item, isCompleted: !currentStatus } : item
          );
          
          // Re-calculate vehicle status based on the new checklist items
          const allCompleted = updatedItems.length > 0 && updatedItems.every(i => i.isCompleted);
          return {
            ...veh,
            status: allCompleted ? "ready" : "in-prep",
            checklist: { ...veh.checklist, items: updatedItems },
          };
        }
        return veh;
      })
    );

    try {
      setTogglingItem((prev) => ({ ...prev, [key]: true }));
      await updateChecklistItem(vehicleId, itemTitle, !currentStatus);
      toast.success(`"${itemTitle}" checklist item updated.`);
    } catch (error) {
      console.error("Failed to update checklist item:", error);
      toast.error("Failed to update checklist item.");
      // Revert UI state on error
      fetchVehicles();
    } finally {
      setTogglingItem((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Filter logic
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.registration_no.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Analytics helper calculations
  const totalCount = vehicles.length;
  const inPrepCount = vehicles.filter(v => v.status === "in-prep").length;
  const readyCount = vehicles.filter(v => v.status === "ready").length;

  return (
    <div className="py-12 flex flex-col gap-8 px-12 pb-16">
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-heading">
            Vehicles Stock Management
          </h1>
          <p className="text-sm text-zinc-500">
            Monitor preparation progress, checklists, expenses, margins, and due dates.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/cars/add")} 
          className="bg-black hover:bg-zinc-800 text-white font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="h-5 w-5" />
          Add Vehicle
        </Button>
      </div>

      {/* Analytics widgets */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-zinc-200/80 bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase">Total Vehicles</span>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
            <div className="h-10 w-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-zinc-700">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-zinc-200/80 bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase">In Preparation</span>
              <p className="text-2xl font-bold text-amber-600">{inPrepCount}</p>
            </div>
            <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-zinc-200/80 bg-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase">Ready for Sale</span>
              <p className="text-2xl font-bold text-emerald-600">{readyCount}</p>
            </div>
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by make/model or registration..."
            className="pl-9 h-10 border-zinc-200 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 self-stretch sm:self-auto overflow-x-auto whitespace-nowrap pb-1 sm:pb-0">
          {["all", "in-prep", "ready", "sold"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className={`h-10 capitalize font-medium ${
                statusFilter === status 
                  ? "bg-black text-white hover:bg-zinc-800" 
                  : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "All Stocks" : status === "in-prep" ? "In Prep" : status === "ready" ? "Ready" : "Sold"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stocks Cards Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
            <span className="text-lg">🚗</span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">No vehicles found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try refining your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredVehicles.map((vehicle) => {
            const checklistItems = vehicle.checklist?.items || [];
            const completedItems = checklistItems.filter(i => i.isCompleted).length;
            const totalItems = checklistItems.length;
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            const totalExpenses = (vehicle.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
            
            const margin = vehicle.status === "sold" && vehicle.soldPrice
              ? vehicle.soldPrice - vehicle.purchasePrice - totalExpenses
              : vehicle.targetRetail - vehicle.purchasePrice - totalExpenses;

            // Formatted Date
            const dueDateObj = new Date(vehicle.dueDate);
            const isOverdue = dueDateObj < new Date() && vehicle.status !== "ready" && vehicle.status !== "sold";

            return (
              <Card 
                key={vehicle._id}
                className="group relative overflow-hidden border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Visual Accent top strip based on status */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-[4px] transition-colors duration-300 ${
                    vehicle.status === "ready" 
                      ? "bg-emerald-500" 
                      : vehicle.status === "sold"
                        ? "bg-zinc-400"
                        : isOverdue 
                          ? "bg-rose-500" 
                          : "bg-amber-500"
                  }`} 
                />

                <CardHeader className="pb-3 pt-6 px-6 relative">
                  {/* Registration No and Status Badge */}
                  <div className="flex items-center justify-between gap-3 mb-2 pr-8">
                    {/* Real UK Plate Style Badge */}
                    <div className="border-[1.5px] border-zinc-800 bg-[#FFD300] text-zinc-950 font-extrabold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded font-mono shadow-sm">
                      {vehicle.registration_no}
                    </div>

                    <span 
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        vehicle.status === "ready"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : vehicle.status === "sold"
                            ? "bg-zinc-50 text-zinc-700 border-zinc-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {vehicle.status === "ready" ? "Ready" : vehicle.status === "sold" ? "Sold" : "In Prep"}
                    </span>
                  </div>

                  <CardTitle className="text-lg font-bold text-zinc-900 tracking-tight line-clamp-1">
                    {vehicle.title}
                  </CardTitle>

                  {/* Edit button in top-right */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(vehicle)}
                    className="absolute top-4 right-4 h-8 w-8 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 rounded-full"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardHeader>

                <CardContent className="px-6 pb-6 space-y-4">
                  {/* 2x2 Grid of detailed pricing & margins */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-50 border border-zinc-100 p-2.5 rounded-lg text-left text-xs font-semibold text-zinc-700">
                    <div className="flex justify-between border-b border-zinc-200/50 pb-1.5 pr-1">
                      <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Cost</span>
                      <span className="text-zinc-800 font-extrabold">&#163;{vehicle.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-200/50 pb-1.5 pl-1 border-l border-zinc-200/50">
                      <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Prep Exp.</span>
                      <span className="text-zinc-800 font-extrabold text-amber-700">&#163;{totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 pr-1">
                      <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                        {vehicle.status === "sold" ? "Sold At" : "Retail Target"}
                      </span>
                      <span className="text-zinc-800 font-extrabold">
                        &#163;{(vehicle.status === "sold" && vehicle.soldPrice ? vehicle.soldPrice : vehicle.targetRetail).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 pl-1 border-l border-zinc-200/50">
                      <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                        {vehicle.status === "sold" ? "Profit" : "Proj. Margin"}
                      </span>
                      <span className="text-emerald-600 font-extrabold">&#163;{margin.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Mileage & Due Date */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Gauge className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span>{vehicle.mileage.toLocaleString()} mi</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${
                      isOverdue 
                        ? "bg-rose-50 text-rose-600 border border-rose-100 font-semibold" 
                        : "text-zinc-500"
                    }`}>
                      {isOverdue ? (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      ) : (
                        <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                      )}
                      <span>
                        Due: {format(dueDateObj, "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (only render if there's a checklist assigned) */}
                  {totalItems > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-zinc-500">Preparation Progress</span>
                        <span className={vehicle.status === "ready" ? "text-emerald-600" : "text-zinc-800"}>
                          {completedItems}/{totalItems} ({progress}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            vehicle.status === "ready" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Checklist List */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 block">Checklist Items</span>
                    {checklistItems.length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-zinc-205 rounded-lg bg-zinc-50/50">
                        <p className="text-[11px] text-zinc-400">No checklist assigned.</p>
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 border border-zinc-100 rounded-lg p-2 bg-zinc-50/50">
                        {checklistItems
                          .sort((a, b) => a.order - b.order)
                          .map((item) => {
                            const itemKey = `${vehicle._id}-${item.title}`;
                            const isToggling = togglingItem[itemKey];

                            return (
                              <button
                                key={item.title}
                                onClick={() => handleToggleChecklist(vehicle._id, item.title, item.isCompleted)}
                                disabled={isToggling || vehicle.status === "sold"}
                                className={`w-full flex items-center justify-between text-left p-1.5 rounded transition-colors text-xs font-medium ${
                                  item.isCompleted 
                                    ? "bg-emerald-50/60 hover:bg-emerald-100/50 text-emerald-800" 
                                    : "hover:bg-zinc-100 text-zinc-700"
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate pr-2">
                                  {item.isCompleted ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                                  )}
                                  <span className={`truncate ${item.isCompleted ? "line-through opacity-70" : ""}`}>
                                    {item.title}
                                  </span>
                                </span>
                                {isToggling && (
                                  <span className="text-[9px] text-zinc-400 uppercase">Saving...</span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  {vehicle.instructions && (
                    <div className="border-t border-zinc-100 pt-3 text-[11px] text-zinc-500">
                      <span className="font-semibold block text-zinc-600 mb-0.5">Notes:</span>
                      <p className="italic line-clamp-2">{vehicle.instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Vehicle Sheet panel */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="bg-white overflow-y-auto max-h-screen sm:max-w-md w-full p-6">
          <SheetHeader className="pb-4 border-b border-zinc-100">
            <SheetTitle className="text-xl font-bold">Edit Vehicle Details</SheetTitle>
            <SheetDescription className="text-xs text-zinc-500">
              Update details for {editingVehicle?.registration_no} in your inventory.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Vehicle Title</label>
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (editErrors.title) setEditErrors(prev => ({ ...prev, title: "" }));
                }}
                className={editErrors.title ? "border-rose-500" : ""}
              />
              {editErrors.title && <span className="text-xs text-rose-500 font-medium">{editErrors.title}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Mileage</label>
              <Input
                type="number"
                value={editMileage}
                onChange={(e) => {
                  setEditMileage(e.target.value);
                  if (editErrors.mileage) setEditErrors(prev => ({ ...prev, mileage: "" }));
                }}
                className={editErrors.mileage ? "border-rose-500" : ""}
              />
              {editErrors.mileage && <span className="text-xs text-rose-500 font-medium">{editErrors.mileage}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Purchase Price (£)</label>
              <Input
                type="number"
                value={editPurchasePrice}
                onChange={(e) => {
                  setEditPurchasePrice(e.target.value);
                  if (editErrors.purchasePrice) setEditErrors(prev => ({ ...prev, purchasePrice: "" }));
                }}
                className={editErrors.purchasePrice ? "border-rose-500" : ""}
              />
              {editErrors.purchasePrice && <span className="text-xs text-rose-500 font-medium">{editErrors.purchasePrice}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Target Retail (£)</label>
              <Input
                type="number"
                value={editTargetRetail}
                onChange={(e) => {
                  setEditTargetRetail(e.target.value);
                  if (editErrors.targetRetail) setEditErrors(prev => ({ ...prev, targetRetail: "" }));
                }}
                className={editErrors.targetRetail ? "border-rose-500" : ""}
              />
              {editErrors.targetRetail && <span className="text-xs text-rose-500 font-medium">{editErrors.targetRetail}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Vehicle Status</label>
              <Select onValueChange={setEditStatus} value={editStatus}>
                <SelectTrigger className="w-full h-10 border border-zinc-200 rounded-md px-3 bg-white">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="in-prep">In Preparation</SelectItem>
                  <SelectItem value="ready">Ready for Sale</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editStatus === "sold" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-700">Sold Price (£)</label>
                <Input
                  type="number"
                  value={editSoldPrice}
                  onChange={(e) => {
                    setEditSoldPrice(e.target.value);
                    if (editErrors.soldPrice) setEditErrors(prev => ({ ...prev, soldPrice: "" }));
                  }}
                  className={editErrors.soldPrice ? "border-rose-500" : ""}
                />
                {editErrors.soldPrice && <span className="text-xs text-rose-500 font-medium">{editErrors.soldPrice}</span>}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Due Date</label>
              <DatePicker
                open={isEditDateOpen}
                setOpen={setIsEditDateOpen}
                date={editDueDate}
                setDate={setEditDueDate}
              />
            </div>

            {/* Expenses List & Add Form */}
            <div className="border-t border-zinc-200 pt-4 space-y-3">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">Prep Expenses</label>
              
              {editExpenses.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No prep expenses added yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {editExpenses.map((exp, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-zinc-50 border border-zinc-200 p-2 rounded-lg">
                      <span className="font-semibold text-zinc-700">{exp.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-zinc-950">&#163;{exp.amount.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpense(idx)}
                          className="text-zinc-400 hover:text-rose-600 font-bold hover:bg-rose-50 rounded h-5 w-5 flex items-center justify-center transition-colors text-base line-height-1"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Add Form */}
              <div className="grid grid-cols-2 gap-2 pt-2 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold">Expense Name</span>
                  <Input
                    type="text"
                    placeholder="e.g. Detailing"
                    value={newExpenseTitle}
                    onChange={(e) => setNewExpenseTitle(e.target.value)}
                    className="h-8 text-xs bg-white border-zinc-200"
                  />
                </div>
                <div className="flex gap-1.5 items-center">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-500 font-semibold">Amount (£)</span>
                    <Input
                      type="number"
                      placeholder="e.g. 120"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="h-8 text-xs bg-white border-zinc-200"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddExpense}
                    className="h-8 bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] font-bold px-2.5 mt-auto"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">Instructions / Notes</label>
              <Input
                type="text"
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-zinc-150 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={editSaving}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-black hover:bg-zinc-800 text-white" disabled={editSaving}>
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CarsStock;