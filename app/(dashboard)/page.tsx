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
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  ListTodo,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardOverview } from "@/lib/api/vehicleAction";
import { SkeletonCard } from "@/components/shared/skeletonCard";

interface DashboardData {
  financials: {
    totalInvestment: number;
    totalRetail: number;
    potentialMargin: number;
    averageMarkup: number;
  };
  pipeline: {
    totalVehicles: number;
    inPrepCount: number;
    readyCount: number;
    yardCompletionRate: number;
    totalChecklistItems: number;
    completedChecklistItems: number;
  };
  commonPendingTasks: Array<{
    title: string;
    count: number;
  }>;
  overdueVehicles: Array<{
    _id: string;
    title: string;
    registration_no: string;
    dueDate: string;
    pendingTasks: number;
    totalTasks: number;
  }>;
  monthlyAnalytics: Array<{
    month: string;
    carsSold: number;
    revenue: number;
    profit: number;
  }>;
  salesComparison: {
    thisMonthCount: number;
    lastMonthCount: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    thisMonthProfit: number;
    lastMonthProfit: number;
  };
}

const DashboardOverview = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Chart states
  const [chartView, setChartView] = useState<"profit-revenue" | "cars-sold">("profit-revenue");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardOverview();
      setData(res);
    } catch (error) {
      console.error("Failed to fetch dashboard overview:", error);
      toast.error("Failed to load dashboard overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview();
  }, [fetchOverview]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col gap-8 px-12 pb-16 max-w-7xl mx-auto">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-100 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-zinc-50 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Growth calculations
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const volumeGrowth = calculateGrowth(data.salesComparison.thisMonthCount, data.salesComparison.lastMonthCount);
  const revenueGrowth = calculateGrowth(data.salesComparison.thisMonthRevenue, data.salesComparison.lastMonthRevenue);
  const profitGrowth = calculateGrowth(data.salesComparison.thisMonthProfit, data.salesComparison.lastMonthProfit);

  // SVG Chart sizing & math
  const chartHeight = 180;
  const chartWidth = 560;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingLeft = 45;
  const paddingRight = 10;
  
  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const maxVal = chartView === "profit-revenue"
    ? Math.max(...data.monthlyAnalytics.map(m => Math.max(m.revenue, m.profit, 1000)))
    : Math.max(...data.monthlyAnalytics.map(m => Math.max(m.carsSold, 5)));

  const getBarHeight = (value: number) => {
    if (maxVal === 0) return 0;
    return (value / maxVal) * graphHeight;
  };

  const spacing = graphWidth / data.monthlyAnalytics.length;

  return (
    <div className="py-12 flex flex-col gap-8 px-12 pb-16 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-heading">
            Overview Dashboard
          </h1>
          <p className="text-sm text-zinc-500">
            Real-time dealership metrics, preparation pipelines, and yard analytics.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => router.push("/cars/add")} 
            className="bg-black hover:bg-zinc-800 text-white font-semibold flex items-center gap-2 h-10 px-4"
          >
            <PlusCircle className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Financials & General Yard KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-zinc-200 bg-white relative overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Capital Invested</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-zinc-900">&#163;{data.financials.totalInvestment.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">Sum of all active vehicle purchase costs</p>
            <div className="absolute right-4 bottom-4 text-zinc-100 -z-0">
              <DollarSign className="h-12 w-12 text-zinc-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white relative overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Potential Yield</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-zinc-900">&#163;{data.financials.totalRetail.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">Expected retail pricing in market</p>
            <div className="absolute right-4 bottom-4 text-zinc-100 -z-0">
              <TrendingUp className="h-12 w-12 text-zinc-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
          <CardContent className="p-6">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Projected Profit</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-emerald-600">&#163;{data.financials.potentialMargin.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Average Markup: {data.financials.averageMarkup}%</p>
            <div className="absolute right-4 bottom-4 text-emerald-50 -z-0">
              <Percent className="h-12 w-12 text-emerald-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white relative overflow-hidden shadow-sm">
          <CardContent className="p-6">
            <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Yard Completion Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-zinc-900">{data.pipeline.yardCompletionRate}%</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              {data.pipeline.completedChecklistItems}/{data.pipeline.totalChecklistItems} checklist tasks completed
            </p>
            <div className="absolute right-4 bottom-4 text-zinc-100 -z-0">
              <CheckCircle className="h-12 w-12 text-zinc-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yard Pipeline Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border border-zinc-200 bg-white p-6 flex flex-row items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Active Stock</span>
            <p className="text-2xl font-bold text-zinc-900">{data.pipeline.totalVehicles} Cars</p>
          </div>
          <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-700 border border-zinc-100">
            <Car className="h-5 w-5" />
          </div>
        </Card>

        <Card className="border border-zinc-200 bg-white p-6 flex flex-row items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">In Prep Room</span>
            <p className="text-2xl font-bold text-amber-600">{data.pipeline.inPrepCount} Cars</p>
          </div>
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
            <Wrench className="h-5 w-5" />
          </div>
        </Card>

        <Card className="border border-zinc-200 bg-white p-6 flex flex-row items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Ready Forecourt</span>
            <p className="text-2xl font-bold text-emerald-600">{data.pipeline.readyCount} Cars</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Visual Analytics Chart & Month-over-Month Growth */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Interactive SVG Chart */}
        <Card className="border border-zinc-200 bg-white shadow-sm md:col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-row items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-zinc-700" />
                <CardTitle className="text-lg font-bold">Sales Analytics Timeline</CardTitle>
              </div>
              <CardDescription className="text-xs text-zinc-500">
                Monthly revenue, profit margins, and vehicles sold over the last 6 months.
              </CardDescription>
            </div>
            <div className="flex gap-1.5 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                onClick={() => setChartView("profit-revenue")}
                className={`text-[10px] font-semibold px-2 py-1 rounded ${
                  chartView === "profit-revenue" 
                    ? "bg-white text-zinc-950 shadow-xs" 
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Profit & Revenue
              </button>
              <button
                onClick={() => setChartView("cars-sold")}
                className={`text-[10px] font-semibold px-2 py-1 rounded ${
                  chartView === "cars-sold" 
                    ? "bg-white text-zinc-950 shadow-xs" 
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Cars Sold
              </button>
            </div>
          </CardHeader>

          <CardContent className="pb-6 pt-2 pr-6 relative flex-1 flex flex-col justify-end">
            <div className="relative w-full h-[180px]">
              <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="carsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Y Axis Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingTop + graphHeight * (1 - ratio);
                  const labelValue = maxVal * ratio;
                  return (
                    <g key={i} className="opacity-40">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#e4e4e7"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3}
                        fill="#71717a"
                        fontSize="9"
                        textAnchor="end"
                        fontWeight="500"
                      >
                        {chartView === "profit-revenue" 
                          ? `£${Math.round(labelValue).toLocaleString()}` 
                          : Math.round(labelValue)}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis line */}
                <line
                  x1={paddingLeft}
                  y1={chartHeight - paddingBottom}
                  x2={chartWidth - paddingRight}
                  y2={chartHeight - paddingBottom}
                  stroke="#d4d4d8"
                  strokeWidth="1"
                />

                {/* Draw Bars */}
                {data.monthlyAnalytics.map((month, idx) => {
                  const x = paddingLeft + (idx * spacing) + (spacing / 2);
                  
                  if (chartView === "profit-revenue") {
                    const revHeight = getBarHeight(month.revenue);
                    const profHeight = getBarHeight(month.profit);
                    
                    const revY = chartHeight - paddingBottom - revHeight;
                    const profY = chartHeight - paddingBottom - profHeight;

                    return (
                      <g key={idx}>
                        {/* Revenue Bar */}
                        <rect
                          x={x - 16}
                          y={revY}
                          width="14"
                          height={Math.max(revHeight, 2)}
                          fill="url(#revenueGrad)"
                          rx="3"
                          className="transition-all duration-300 hover:opacity-100 opacity-90"
                        />
                        {/* Profit Bar */}
                        <rect
                          x={x + 2}
                          y={profY}
                          width="14"
                          height={Math.max(profHeight, 2)}
                          fill="url(#profitGrad)"
                          rx="3"
                          className="transition-all duration-300 hover:opacity-100 opacity-90"
                        />
                      </g>
                    );
                  } else {
                    const carsHeight = getBarHeight(month.carsSold);
                    const carsY = chartHeight - paddingBottom - carsHeight;
                    
                    return (
                      <rect
                        key={idx}
                        x={x - 12}
                        y={carsY}
                        width="24"
                        height={Math.max(carsHeight, 2)}
                        fill="url(#carsGrad)"
                        rx="3"
                        className="transition-all duration-300 hover:opacity-100 opacity-90"
                      />
                    );
                  }
                })}

                {/* Labels on X Axis */}
                {data.monthlyAnalytics.map((month, idx) => {
                  const x = paddingLeft + (idx * spacing) + (spacing / 2);
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight - 12}
                      fill="#71717a"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {month.month.split(" ")[0]}
                    </text>
                  );
                })}

                {/* Interactive Tooltip Hover zones */}
                {data.monthlyAnalytics.map((month, idx) => {
                  const x = paddingLeft + (idx * spacing);
                  return (
                    <rect
                      key={idx}
                      x={x}
                      y={paddingTop}
                      width={spacing}
                      height={graphHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  );
                })}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredBar !== null && (
                <div 
                  className="absolute bg-zinc-950/95 border border-zinc-800 text-white rounded-lg p-2.5 shadow-md text-[11px] pointer-events-none transition-all duration-150"
                  style={{
                    left: `${(hoveredBar * spacing) + paddingLeft + 15}px`,
                    top: `10px`,
                    transform: `translateX(0px)`,
                    zIndex: 20
                  }}
                >
                  <p className="font-bold border-b border-zinc-800 pb-1 mb-1.5 text-zinc-400">
                    {data.monthlyAnalytics[hoveredBar].month}
                  </p>
                  <div className="space-y-1">
                    <p className="flex justify-between gap-6">
                      <span>Cars Sold:</span>
                      <span className="font-bold text-cyan-400">{data.monthlyAnalytics[hoveredBar].carsSold}</span>
                    </p>
                    <p className="flex justify-between gap-6">
                      <span>Revenue:</span>
                      <span className="font-bold text-indigo-400">£{data.monthlyAnalytics[hoveredBar].revenue.toLocaleString()}</span>
                    </p>
                    <p className="flex justify-between gap-6">
                      <span>Profit:</span>
                      <span className="font-bold text-emerald-400">£{data.monthlyAnalytics[hoveredBar].profit.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chart Legend */}
            <div className="flex gap-4 items-center justify-center mt-3 text-[10px] text-zinc-500 font-semibold">
              {chartView === "profit-revenue" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-4 rounded bg-indigo-600" />
                    <span>Revenue (£)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-4 rounded bg-emerald-500" />
                    <span>Net Profit (£)</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-4 rounded bg-cyan-500" />
                  <span>Vehicles Sold Count</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Growth Comparison Widget */}
        <Card className="border border-zinc-200 bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <CardTitle className="text-lg font-bold">MoM Growth Comparison</CardTitle>
            <CardDescription className="text-xs text-zinc-500 font-medium">
              Performance relative to last month
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-around gap-4">
            
            {/* Cars Sold Growth */}
            <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Volume Sold</span>
                <span className="text-xl font-extrabold text-zinc-900 mt-1 block">
                  {data.salesComparison.thisMonthCount} Cars
                </span>
                <span className="text-[9px] text-zinc-400 mt-0.5 block">Last Month: {data.salesComparison.lastMonthCount}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                volumeGrowth >= 0 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}>
                {volumeGrowth >= 0 ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>{Math.abs(volumeGrowth)}%</span>
              </div>
            </div>

            {/* Revenue Growth */}
            <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Total Revenue</span>
                <span className="text-xl font-extrabold text-zinc-900 mt-1 block">
                  £{data.salesComparison.thisMonthRevenue.toLocaleString()}
                </span>
                <span className="text-[9px] text-zinc-400 mt-0.5 block">Last Month: £{data.salesComparison.lastMonthRevenue.toLocaleString()}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                revenueGrowth >= 0 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}>
                {revenueGrowth >= 0 ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>{Math.abs(revenueGrowth)}%</span>
              </div>
            </div>

            {/* Profit Growth */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Net Profit Yield</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                  £{data.salesComparison.thisMonthProfit.toLocaleString()}
                </span>
                <span className="text-[9px] text-zinc-400 mt-0.5 block">Last Month: £{data.salesComparison.lastMonthProfit.toLocaleString()}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${
                profitGrowth >= 0 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}>
                {profitGrowth >= 0 ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                <span>{Math.abs(profitGrowth)}%</span>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overdue Vehicles Panel */}
        <Card className="border border-zinc-200 bg-white flex flex-col shadow-sm">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-rose-500 shrink-0" />
                <CardTitle className="text-lg font-bold text-zinc-900">Immediate Action Required</CardTitle>
              </div>
              <span className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {data.overdueVehicles.length} Overdue
              </span>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              Vehicles that are past their expected preparation due dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            {data.overdueVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-900">Yard is on schedule!</h4>
                <p className="text-xs text-zinc-500 mt-1">No vehicles are currently overdue.</p>
              </div>
            ) : (
              <div className="space-y-3 divide-y divide-zinc-100">
                {data.overdueVehicles.map((vehicle) => {
                  const daysOverdue = Math.ceil(
                    (new Date().getTime() - new Date(vehicle.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div 
                      key={vehicle._id} 
                      onClick={() => router.push("/cars")}
                      className="flex items-center justify-between gap-4 pt-3 first:pt-0 group cursor-pointer hover:bg-zinc-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="border border-zinc-800 bg-[#FFD300] text-zinc-950 font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-mono shadow-sm shrink-0">
                            {vehicle.registration_no}
                          </span>
                          <span className="font-semibold text-sm text-zinc-900 truncate group-hover:text-black">
                            {vehicle.title}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                          Overdue by <span className="font-semibold text-rose-600">{daysOverdue} {daysOverdue === 1 ? "day" : "days"}</span> 
                          ({format(new Date(vehicle.dueDate), "MMM dd")})
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                          {vehicle.pendingTasks} pending
                        </span>
                        <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {data.overdueVehicles.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => router.push("/cars")} 
                className="w-full text-xs text-zinc-500 hover:text-black mt-4 hover:bg-zinc-50 flex items-center justify-center gap-1.5 pt-3 border-t border-zinc-100 rounded-none"
              >
                View all vehicles in stock
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Common Pending Operations Panel */}
        <Card className="border border-zinc-200 bg-white flex flex-col shadow-sm">
          <CardHeader className="pb-3 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-indigo-500 shrink-0" />
                <CardTitle className="text-lg font-bold text-zinc-900">Task Batching Operations</CardTitle>
              </div>
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Operations
              </span>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              Most common pending checklist tasks. Batch-assign to increase efficiency.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            {data.commonPendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
                <h4 className="text-sm font-semibold text-zinc-900">All tasks completed!</h4>
                <p className="text-xs text-zinc-500 mt-1">No pending tasks found across active vehicles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.commonPendingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm text-zinc-700 truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                        {task.count} {task.count === 1 ? "vehicle" : "vehicles"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-zinc-100 mt-4 text-[10px] text-zinc-400 text-center font-medium">
              Task counts indicate how many vehicles share this pending checklist task.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;