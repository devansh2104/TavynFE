import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, TrendingUp, TrendingDown, IndianRupee, Building2 } from 'lucide-react';
import { dashboardService, financeService, electricityService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import { useAutoSync } from '../../hooks/useAutoSync';

export default function Reports() {
  const { selectedHostelId, selectedHostel } = useBuilding();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [overview, setOverview] = useState(null);
  const [rents, setRents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [ov, rnRes, exRes, elRes] = await Promise.all([
        dashboardService.getOverview(selectedHostelId).catch(() => null),
        financeService.getRents({
          hostelId: selectedHostelId,
          month: selectedMonth,
          year: selectedYear,
          limit: 1000
        }).catch(() => ({ rents: [] })),
        financeService.getExpenses({
          hostelId: selectedHostelId,
          limit: 1000
        }).catch(() => ({ expenses: [] })),
        electricityService.getReadings({
          hostelId: selectedHostelId,
          month: selectedMonth,
          year: selectedYear,
          limit: 1000
        }).catch(() => ({ readings: [] }))
      ]);

      setOverview(ov);
      setRents(rnRes.rents || (Array.isArray(rnRes) ? rnRes : []));
      setExpenses(exRes.expenses || (Array.isArray(exRes) ? exRes : []));
      setReadings(elRes.readings || (Array.isArray(elRes) ? elRes : []));
    } catch (err) {
      console.error('Failed to compile reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedHostelId, selectedMonth, selectedYear]);

  useAutoSync(() => fetchReportData(true));

  const rentCollected = rents
    .filter((r) => r.status === 'Paid')
    .reduce((acc, r) => acc + (r.amount || 0), 0);

  const rentPending = rents
    .filter((r) => r.status !== 'Paid')
    .reduce((acc, r) => acc + (r.amount || 0), 0);

  const electricityBilled = readings.reduce((acc, el) => acc + (el.netAmount || el.billAmount || 0), 0);
  const totalCollections = rentCollected + electricityBilled;
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netOperatingIncome = totalCollections - totalExpenses;

  // Expense breakdown by category
  const expenseBreakdown = expenses.reduce((acc, cur) => {
    acc[cur.category] = (acc[cur.category] || 0) + cur.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-in fade-in pb-20 max-w-4xl mx-auto">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Monthly P&L & Occupancy Report
          </h2>
          <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Building2 className="h-4 w-4 text-primary" />
            <span>{selectedHostel?.name || 'All Properties'}</span>
            <span>•</span>
            <span>Month {selectedMonth}/{selectedYear}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={m + 1}>
                Month {m + 1}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          <Button variant="outline" size="sm" onClick={() => alert('Report summary copied to clipboard')} className="gap-1.5">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button size="sm" onClick={() => window.print()} className="gap-1.5">
            <Download className="h-4 w-4" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* REVENUE / COLLECTIONS */}
        <Card className="border-success/30 shadow-sm bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total Inflow (Collections)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-success">₹{totalCollections.toLocaleString()}</div>
            <div className="mt-4 space-y-2 text-sm font-medium">
              <div className="flex justify-between border-b border-success/15 pb-1">
                <span className="text-muted-foreground">Rent Collected</span>
                <span>₹{rentCollected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-success/15 pb-1">
                <span className="text-muted-foreground">Electricity Billed</span>
                <span>₹{electricityBilled.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-1 text-warning">
                <span className="text-muted-foreground">Pending Rent Receivables</span>
                <span>₹{rentPending.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EXPENSES / OUTFLOW */}
        <Card className="border-destructive/30 shadow-sm bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Total Outflow (Expenses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-destructive">₹{totalExpenses.toLocaleString()}</div>
            <div className="mt-4 space-y-2 text-sm font-medium">
              {Object.keys(expenseBreakdown).length === 0 ? (
                <p className="text-xs text-muted-foreground">No expenses logged for this cycle.</p>
              ) : (
                Object.entries(expenseBreakdown).slice(0, 3).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between border-b border-destructive/15 pb-1">
                    <span className="text-muted-foreground">{cat}</span>
                    <span>₹{val.toLocaleString()}</span>
                  </div>
                ))
              )}
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Total Invoices</span>
                <span>{expenses.length} records</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* KPI: OCCUPANCY */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Physical Capacity & Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.occupancyRate || '0%'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.occupiedBeds ?? 0} occupied of {overview?.totalBeds ?? 0} total beds ({overview?.vacantBeds ?? 0} vacant)
            </p>
          </CardContent>
        </Card>

        {/* KPI: NET OPERATING INCOME */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80 flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Net Operating Balance (P&L)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">₹{netOperatingIncome.toLocaleString()}</div>
            <p className="text-xs text-primary-foreground/80 mt-1">
              Net balance (Total Inflow minus Outflow)
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
