"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Car, 
  Search, 
  ArrowUpDown, 
  Receipt,
  Percent
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getVehicles } from "@/lib/api/vehicleAction";
import { SkeletonCard } from "@/components/shared/skeletonCard";

interface ExpenseItem {
  _id?: string;
  title: string;
  amount: number;
  date?: string;
}

interface VehicleWithExpenses {
  _id: string;
  registration_no: string;
  title: string;
  purchasePrice: number;
  targetRetail: number;
  dueDate: string;
  status: string;
  expenses?: ExpenseItem[];
}

interface FlatExpense {
  vehicleId: string;
  vehicleTitle: string;
  registration_no: string;
  expenseTitle: string;
  amount: number;
  date: Date;
}

const ExpensesDashboard = () => {
  const [vehicles, setVehicles] = useState<VehicleWithExpenses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getVehicles();
      setVehicles(res?.data || []);
    } catch (error) {
      console.error("Failed to fetch vehicles for expenses:", error);
      toast.error("Failed to load expenses data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVehicles();
  }, [fetchVehicles]);

  // Flatten expenses for the table & charts
  const flatExpenses = useMemo(() => {
    const list: FlatExpense[] = [];
    vehicles.forEach((vehicle) => {
      if (vehicle.expenses && vehicle.expenses.length > 0) {
        vehicle.expenses.forEach((exp) => {
          list.push({
            vehicleId: vehicle._id,
            vehicleTitle: vehicle.title,
            registration_no: vehicle.registration_no,
            expenseTitle: exp.title,
            amount: exp.amount,
            date: exp.date ? new Date(exp.date) : new Date(vehicle.dueDate)
          });
        });
      }
    });
    return list;
  }, [vehicles]);

  // Filtering & Sorting
  const processedExpenses = useMemo(() => {
    return flatExpenses
      .filter((exp) => {
        const query = searchQuery.toLowerCase();
        return (
          exp.expenseTitle.toLowerCase().includes(query) ||
          exp.vehicleTitle.toLowerCase().includes(query) ||
          exp.registration_no.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === "date") {
          comparison = a.date.getTime() - b.date.getTime();
        } else {
          comparison = a.amount - b.amount;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [flatExpenses, searchQuery, sortField, sortOrder]);

  // Financial aggregates
  const stats = useMemo(() => {
    const total = flatExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const vehiclesWithExpenses = vehicles.filter(v => v.expenses && v.expenses.length > 0);
    const average = vehiclesWithExpenses.length > 0 ? total / vehiclesWithExpenses.length : 0;
    
    // Find highest expense vehicle
    let highestExpenseVehicle = "None";
    let highestAmount = 0;
    vehicles.forEach((v) => {
      const expSum = (v.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
      if (expSum > highestAmount) {
        highestAmount = expSum;
        highestExpenseVehicle = `${v.title} (${v.registration_no})`;
      }
    });

    return {
      total,
      average,
      count: flatExpenses.length,
      highestVehicle: highestExpenseVehicle,
      highestAmount
    };
  }, [flatExpenses, vehicles]);

  // Last 6 Months Grouping for SVG Chart
  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsList = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();

      const totalForMonth = flatExpenses
        .filter((exp) => {
          return exp.date.getMonth() === targetMonth && exp.date.getFullYear() === targetYear;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      monthsList.push({
        label: `${monthNames[targetMonth]}`,
        amount: totalForMonth
      });
    }
    return monthsList;
  }, [flatExpenses]);

  // Toggle sorting
  const handleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // SVG dimensions
  const chartWidth = 560;
  const chartHeight = 160;
  const graphWidth = chartWidth - 55;
  const graphHeight = chartHeight - 40;
  const maxVal = Math.max(...chartData.map(c => c.amount), 500);

  if (loading) {
    return (
      <div className="py-12 flex flex-col gap-8 px-12 pb-16 max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-100 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-zinc-50 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
        <SkeletonCard className="h-80" />
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col gap-8 px-12 pb-16 max-w-7xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-heading">
          Expenses Tracking
        </h1>
        <p className="text-sm text-zinc-500">
          Track preparation costs, mechanical repairs, and parts expenditures across stock.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-zinc-200 bg-white relative overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Total Prep Outlay</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-zinc-900">&#163;{stats.total.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">Accumulated expenditures across all inventory</p>
            <div className="absolute right-4 bottom-4 text-zinc-50 -z-0">
              <Receipt className="h-12 w-12 text-zinc-150" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white relative overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Avg. Cost Per Car</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-zinc-900">&#163;{Math.round(stats.average).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">Calculated from cars with active expenses</p>
            <div className="absolute right-4 bottom-4 text-zinc-50 -z-0">
              <Percent className="h-12 w-12 text-zinc-150" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white relative overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Highest Prep Vehicle</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg font-bold text-amber-700 truncate block max-w-[220px]">
                {stats.highestVehicle}
              </span>
            </div>
            <p className="text-[10px] text-amber-600 mt-1 font-semibold">Total outlay: &#163;{stats.highestAmount.toLocaleString()}</p>
            <div className="absolute right-4 bottom-4 text-amber-50 -z-0">
              <Car className="h-12 w-12 text-amber-100/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expenses Chart & Top Items Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* SVG Expense Bar Chart */}
        <Card className="border border-zinc-200 bg-white shadow-sm md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Monthly Expense Outlays</CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Trend of capital allocated to preparation expenses over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="relative w-full h-[160px]">
              <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 20 + graphHeight * (1 - ratio);
                  const labelValue = maxVal * ratio;
                  return (
                    <g key={i} className="opacity-40">
                      <line
                        x1="50"
                        y1={y}
                        x2={chartWidth - 10}
                        y2={y}
                        stroke="#e4e4e7"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x="42"
                        y={y + 3}
                        fill="#71717a"
                        fontSize="9"
                        textAnchor="end"
                        fontWeight="500"
                      >
                        £{Math.round(labelValue).toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis line */}
                <line
                  x1="50"
                  y1={chartHeight - 25}
                  x2={chartWidth - 10}
                  y2={chartHeight - 25}
                  stroke="#d4d4d8"
                  strokeWidth="1"
                />

                {/* Draw bars */}
                {chartData.map((data, idx) => {
                  const spacing = graphWidth / chartData.length;
                  const x = 50 + (idx * spacing) + (spacing / 2);
                  const barH = (data.amount / maxVal) * graphHeight;
                  const y = chartHeight - 25 - barH;

                  return (
                    <g key={idx}>
                      <rect
                        x={x - 16}
                        y={y}
                        width="32"
                        height={Math.max(barH, 2)}
                        fill="url(#expenseGrad)"
                        rx="4"
                      />
                      {/* Amount above bar */}
                      {data.amount > 0 && (
                        <text
                          x={x}
                          y={y - 5}
                          fill="#71717a"
                          fontSize="9"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          £{data.amount.toLocaleString()}
                        </text>
                      )}
                      {/* Label below bar */}
                      <text
                        x={x}
                        y={chartHeight - 10}
                        fill="#71717a"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {data.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Summary Box */}
        <Card className="border border-zinc-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-base font-bold">Quick Insights</CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Operational expenditure details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-around gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
              <span className="text-zinc-500 font-semibold">Total Cost Items</span>
              <span className="font-extrabold text-zinc-950">{stats.count} items</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
              <span className="text-zinc-500 font-semibold">Average Item Outlay</span>
              <span className="font-extrabold text-zinc-950">
                £{stats.count > 0 ? Math.round(stats.total / stats.count).toLocaleString() : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-semibold">Vehicles Prepared</span>
              <span className="font-extrabold text-zinc-950">
                {vehicles.filter(v => v.expenses && v.expenses.length > 0).length} of {vehicles.length} cars
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Log Table */}
      <Card className="border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
          <div>
            <CardTitle className="text-base font-bold">Expense Logs</CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Granular view of all preparation itemized costs.
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              placeholder="Search expenses..."
              className="pl-9 h-8 text-xs border-zinc-200 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {processedExpenses.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs italic">
              No matching expense items found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-3 px-5">Vehicle</th>
                    <th className="py-3 px-5">Expense Description</th>
                    <th className="py-3 px-5 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort("date")}>
                      <span className="flex items-center gap-1.5">
                        Date Added
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                    <th className="py-3 px-5 text-right cursor-pointer hover:bg-zinc-100" onClick={() => handleSort("amount")}>
                      <span className="flex items-center justify-end gap-1.5">
                        Amount
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                  {processedExpenses.map((exp, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span className="border border-zinc-800 bg-[#FFD300] text-zinc-950 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-mono shrink-0">
                            {exp.registration_no}
                          </span>
                          <span className="font-semibold text-zinc-900 truncate max-w-[180px]">{exp.vehicleTitle}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-semibold text-zinc-850">{exp.expenseTitle}</td>
                      <td className="py-3 px-5 text-zinc-500">{format(exp.date, "MMM dd, yyyy")}</td>
                      <td className="py-3 px-5 text-right font-bold text-zinc-950">£{exp.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesDashboard;
