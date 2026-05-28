import { connectDB } from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import VehicleChecklist from "@/models/VehicleChecklist";

interface IChecklistItem {
  title: string;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
}

interface ExpenseItem {
  title: string;
  amount: number;
  date?: Date | string;
}

interface VehicleDoc {
  _id: unknown;
  registration_no: string;
  title: string;
  purchasePrice: number;
  targetRetail: number;
  dueDate: Date | string;
  status: string;
  expenses?: ExpenseItem[];
}

interface OverdueVehicle {
  _id: unknown;
  title: string;
  registration_no: string;
  dueDate: Date | string;
  pendingTasks: number;
  totalTasks: number;
}

interface SoldVehicleDoc {
  soldAt: Date | string | null;
  soldPrice: number;
  purchasePrice: number;
  expenses?: ExpenseItem[];
}

export async function GET() {
  await connectDB();

  // Get active inventory (not sold)
  const vehicles = await Vehicle.find({ isSold: { $ne: true } }).lean();

  let totalInvestment = 0;
  let totalRetail = 0;
  let inPrepCount = 0;
  let readyCount = 0;
  const overdueVehicles: OverdueVehicle[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch checklists in parallel
  const checklistData = await Promise.all(
    vehicles.map(async (vehicle) => {
      const v = vehicle as unknown as VehicleDoc;
      const checklist = await VehicleChecklist.findOne({ vehicleId: v._id }).lean();
      return {
        vehicle: v,
        checklist
      };
    })
  );

  let totalChecklistItems = 0;
  let completedChecklistItems = 0;
  const taskFrequencyMap: { [key: string]: number } = {};

  checklistData.forEach(({ vehicle, checklist }) => {
    const vehicleExpensesSum = (vehicle.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Financial calculations (Capital Invested includes prep expenses)
    totalInvestment += ((vehicle.purchasePrice || 0) + vehicleExpensesSum);
    totalRetail += (vehicle.targetRetail || 0);

    // Status counts
    if (vehicle.status === "ready") {
      readyCount++;
    } else {
      inPrepCount++;
    }

    const dueDateObj = new Date(vehicle.dueDate);
    const isOverdue = dueDateObj < today && vehicle.status !== "ready";

    // Checklist details
    const items = (checklist?.items || []) as IChecklistItem[];
    const totalItems = items.length;
    const completedItems = items.filter((item: IChecklistItem) => item.isCompleted).length;

    totalChecklistItems += totalItems;
    completedChecklistItems += completedItems;

    // Task grouping / batching (only for incomplete tasks)
    items.forEach((item: IChecklistItem) => {
      if (!item.isCompleted) {
        taskFrequencyMap[item.title] = (taskFrequencyMap[item.title] || 0) + 1;
      }
    });

    if (isOverdue) {
      overdueVehicles.push({
        _id: vehicle._id,
        title: vehicle.title,
        registration_no: vehicle.registration_no,
        dueDate: vehicle.dueDate,
        pendingTasks: totalItems - completedItems,
        totalTasks: totalItems,
      });
    }
  });

  const potentialMargin = totalRetail - totalInvestment;
  const averageMarkup = totalInvestment > 0 ? Math.round((potentialMargin / totalInvestment) * 100) : 0;
  const yardCompletionRate = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

  // Convert task frequencies to sorted array
  const commonPendingTasks = Object.entries(taskFrequencyMap)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Monthly Sales Analytics (Last 6 Months)
  const monthlyAnalytics = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const soldVehicles = (await Vehicle.find({ isSold: true, soldAt: { $ne: null } }).lean()) as unknown as SoldVehicleDoc[];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1); // Avoid month-end spillover bugs
    d.setMonth(d.getMonth() - i);
    const targetMonth = d.getMonth();
    const targetYear = d.getFullYear();

    const monthSales = soldVehicles.filter((v) => {
      if (!v.soldAt) return false;
      const saleDate = new Date(v.soldAt);
      return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
    });

    let revenue = 0;
    let cost = 0;

    monthSales.forEach((v) => {
      const vehicleExpensesSum = (v.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
      revenue += (v.soldPrice || 0);
      cost += ((v.purchasePrice || 0) + vehicleExpensesSum);
    });
    const profit = revenue - cost;

    monthlyAnalytics.push({
      month: `${monthNames[targetMonth]} ${targetYear}`,
      carsSold: monthSales.length,
      revenue,
      profit
    });
  }

  // 4. This Month vs Last Month growth comparisons
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const prevMonthDate = new Date();
  prevMonthDate.setDate(1);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const lastMonth = prevMonthDate.getMonth();
  const lastMonthYear = prevMonthDate.getFullYear();

  const thisMonthSales = soldVehicles.filter((v) => {
    if (!v.soldAt) return false;
    const saleDate = new Date(v.soldAt);
    return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
  });

  const lastMonthSales = soldVehicles.filter((v) => {
    if (!v.soldAt) return false;
    const saleDate = new Date(v.soldAt);
    return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear;
  });

  let thisMonthRevenue = 0;
  let thisMonthCost = 0;
  thisMonthSales.forEach((v) => {
    const vehicleExpensesSum = (v.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
    thisMonthRevenue += (v.soldPrice || 0);
    thisMonthCost += ((v.purchasePrice || 0) + vehicleExpensesSum);
  });
  const thisMonthProfit = thisMonthRevenue - thisMonthCost;

  let lastMonthRevenue = 0;
  let lastMonthCost = 0;
  lastMonthSales.forEach((v) => {
    const vehicleExpensesSum = (v.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
    lastMonthRevenue += (v.soldPrice || 0);
    lastMonthCost += ((v.purchasePrice || 0) + vehicleExpensesSum);
  });
  const lastMonthProfit = lastMonthRevenue - lastMonthCost;

  return Response.json({
    financials: {
      totalInvestment,
      totalRetail,
      potentialMargin,
      averageMarkup
    },
    pipeline: {
      totalVehicles: vehicles.length,
      inPrepCount,
      readyCount,
      yardCompletionRate,
      totalChecklistItems,
      completedChecklistItems
    },
    commonPendingTasks,
    overdueVehicles: overdueVehicles.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5),
    monthlyAnalytics,
    salesComparison: {
      thisMonthCount: thisMonthSales.length,
      lastMonthCount: lastMonthSales.length,
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthProfit,
      lastMonthProfit
    }
  });
}
