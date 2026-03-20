import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    // Fetch sales data with supplier and yarn information
    const sales = await db.collection("sales").find({}).toArray();
    const completedJobs = await db.collection("completed_jobs").find({}).toArray();
    const products = await db.collection("products").find({}).toArray();

    // 1. Supplier Sales Analysis
    const supplierSales: Record<string, number> = {};
    sales.forEach((sale: any) => {
      const supplier = sale.supplier || "Unknown";
      const value = Number(sale.value) || 0;
      supplierSales[supplier] = (supplierSales[supplier] || 0) + value;
    });

    const supplierData = Object.entries(supplierSales).map(([name, value]) => ({
      name,
      sales: value,
    }));

    // 2. Yarn Types Usage Analysis
    const yarnTypes: Record<string, number> = {};
    sales.forEach((sale: any) => {
      const yarnName = sale.name || "Unknown";
      yarnTypes[yarnName] = (yarnTypes[yarnName] || 0) + 1;
    });

    const yarnTypeData = Object.entries(yarnTypes).map(([name, count]) => ({
      name,
      value: count,
    }));

    // 3. Grade-based Profit Analysis
    // We'll use sales data and calculate profit based on grade
    const gradeProfit: Record<string, { totalSales: number; count: number }> = {
      A: { totalSales: 0, count: 0 },
      B: { totalSales: 0, count: 0 },
      C: { totalSales: 0, count: 0 },
      D: { totalSales: 0, count: 0 },
    };

    // Match sales with products to get grade information
    sales.forEach((sale: any) => {
      // Try to find the product by name to get grade
      const product = products.find((p: any) => p.name === sale.name);
      // Prioritize the actual sale grade (output), then product grade, then default
      const grade = (sale.grade || product?.quality || "A").toUpperCase();

      if (gradeProfit[grade]) {
        gradeProfit[grade].totalSales += Number(sale.value) || 0;
        gradeProfit[grade].count += 1;
      }
    });

    const gradeData = Object.entries(gradeProfit).map(([grade, data]) => ({
      grade,
      profit: data.totalSales,
      count: data.count,
      avgProfit: data.count > 0 ? Math.round(data.totalSales / data.count) : 0,
    }));

    // 4. Summary Statistics
    const totalSales = sales.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
    const totalJobs = sales.length;
    const totalWeight = sales.reduce((sum, s) => sum + (Number(s.weight) || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        supplierSales: supplierData,
        yarnTypes: yarnTypeData,
        gradeProfits: gradeData,
        summary: {
          totalSales,
          totalJobs,
          totalWeight,
          avgSalesPerJob: totalJobs > 0 ? Math.round(totalSales / totalJobs) : 0,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching analytics:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics", details: message },
      { status: 500 }
    );
  }
}
