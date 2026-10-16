import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  FileText, 
  CreditCard, 
  ArrowUpRight, 
  Plus, 
  AlertCircle,
  Download,
  DollarSign,
  Zap,
  Wrench,
  Home,
  X
} from 'lucide-react';
import { financeService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import { useAutoSync } from '../../hooks/useAutoSync';
import Pagination from '../../components/Pagination';
import InvoiceModal from '../../components/InvoiceModal';
import { KpiCard } from '../../components/dashboard/KpiCard';
import AskAiSearchBox from '../../components/AskAiSearchBox';

export default function Rent() {
  const { selectedHostelId, selectedHostel } = useBuilding();

  const [rents, setRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRent, setSelectedRent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Collect popup toggle states (all ON by default)
  const [toggleRent, setToggleRent] = useState(true);
  const [toggleElectricity, setToggleElectricity] = useState(true);
  const [toggleMaintenance, setToggleMaintenance] = useState(true);

  // Invoice Modal state
  const [invoiceRent, setInvoiceRent] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Generation state
  const [generating, setGenerating] = useState(false);

  const fetchRents = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await financeService.getRents({
        hostelId: selectedHostelId,
        status: statusFilter,
        month: monthFilter || undefined,
        year: yearFilter || undefined,
        search,
        page,
        limit: 10
      });

      const rentList = res.rents || (Array.isArray(res) ? res : []);
      setRents(rentList);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || rentList.length);
    } catch (err) {
      console.error('Failed to fetch rents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRents();
  }, [selectedHostelId, statusFilter, monthFilter, yearFilter, page]);

  useAutoSync(() => fetchRents(true));

  const handleGenerateMonthly = async () => {
    if (!selectedHostelId) return;
    const now = new Date();
    const curM = now.getMonth() + 1;
    const curY = now.getFullYear();
    setGenerating(true);
    try {
      const res = await financeService.generateMonthlyRent(curM, curY, selectedHostelId);
      alert(res.message || 'Rent bills generated successfully');
      fetchRents();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setGenerating(false);
    }
  };

  const updateCollectingAmount = (rToggle, eToggle, mToggle, rentObj = selectedRent) => {
    if (!rentObj) return;
    const rAmount = rentObj.rentAmount ?? rentObj.tenant?.rentAmount ?? 0;
    const eAmount = rentObj.electricityAmount ?? 0;
    const mAmount = rentObj.maintenanceAmount ?? rentObj.tenant?.maintenanceFee ?? 0;

    let sum = 0;
    if (rToggle) sum += rAmount;
    if (eToggle) sum += eAmount;
    if (mToggle) sum += mAmount;
    setPaymentAmount(sum.toString());
  };

  const formatBreakdown = (rent) => {
    if (!rent) return '';
    if (rent.breakdownLabel) return rent.breakdownLabel;
    const parts = [];
    const r = rent.rentAmount ?? rent.tenant?.rentAmount ?? 0;
    const e = rent.electricityAmount ?? 0;
    const m = rent.maintenanceAmount ?? rent.tenant?.maintenanceFee ?? 0;
    const l = rent.lateFee ?? 0;
    if (r > 0) parts.push(`Rent ₹${r.toLocaleString()}`);
    if (e > 0) parts.push(`Elec ₹${e.toLocaleString()}`);
    if (m > 0) parts.push(`Maint ₹${m.toLocaleString()}`);
    if (l > 0) parts.push(`Late ₹${l.toLocaleString()}`);
    return parts.length > 0 ? parts.join(' + ') : `Rent ₹${(rent.amount || 0).toLocaleString()}`;
  };

  const handleCollectClick = (rent) => {
    setSelectedRent(rent);

    const rAmount = rent.rentAmount ?? rent.tenant?.rentAmount ?? 0;
    const eAmount = rent.electricityAmount ?? 0;
    const mAmount = rent.maintenanceAmount ?? rent.tenant?.maintenanceFee ?? 0;
    const totalPaid = rent.totalPaidAmount ?? (rent.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    // Default toggles dynamically: if rent already settled, default to collecting unpaid balance
    let initRent = totalPaid < rAmount;
    let initElec = eAmount > 0;
    let initMaint = mAmount > 0 && totalPaid < (rAmount + mAmount);

    if (rent.status === 'Electricity Due') {
      initRent = false;
      initElec = true;
      initMaint = false;
    } else if (rent.status === 'Maintenance Due') {
      initRent = false;
      initElec = false;
      initMaint = true;
    } else if (rent.status === 'Electricity & Maint. Due') {
      initRent = false;
      initElec = true;
      initMaint = true;
    } else if (rent.status === 'Rent Due') {
      initRent = true;
      initElec = false;
      initMaint = false;
    }

    setToggleRent(initRent);
    setToggleElectricity(initElec);
    setToggleMaintenance(initMaint);

    updateCollectingAmount(initRent, initElec, initMaint, rent);
  };

  const handleOpenInvoice = (rent) => {
    setInvoiceRent(rent);
    setIsInvoiceOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedRent) return;
    setSubmitting(true);
    try {
      const rAmount = selectedRent.rentAmount ?? selectedRent.tenant?.rentAmount ?? 0;
      const eAmount = selectedRent.electricityAmount ?? 0;
      const mAmount = selectedRent.maintenanceAmount ?? selectedRent.tenant?.maintenanceFee ?? 0;

      // Identify unpaid components
      const unpaidItems = [];
      if (!toggleRent && rAmount > 0) unpaidItems.push('Rent');
      if (!toggleElectricity && eAmount > 0) unpaidItems.push('Electricity');
      if (!toggleMaintenance && mAmount > 0) unpaidItems.push('Maintenance');

      let calculatedStatus = 'Paid';
      if (unpaidItems.length === 1) {
        calculatedStatus = `${unpaidItems[0]} Due`;
      } else if (unpaidItems.length === 2) {
        if (unpaidItems.includes('Electricity') && unpaidItems.includes('Maintenance')) {
          calculatedStatus = 'Electricity & Maint. Due';
        } else if (unpaidItems.includes('Rent') && unpaidItems.includes('Electricity')) {
          calculatedStatus = 'Rent & Electricity Due';
        } else {
          calculatedStatus = 'Rent & Maint. Due';
        }
      } else if (unpaidItems.length >= 3) {
        calculatedStatus = 'Payment Due';
      }

      await financeService.recordPayment({
        tenantId: selectedRent.tenantId,
        rentId: selectedRent.id,
        amount: parseFloat(paymentAmount) || 0,
        method,
        referenceId: reference || null,
        status: calculatedStatus,
        paidComponents: {
          rent: toggleRent,
          electricity: toggleElectricity,
          maintenance: toggleMaintenance
        }
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedRent(null);
        fetchRents();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'Paid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Paid & Settled
        </span>
      );
    }

    if (status === 'Electricity Due') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Zap className="h-3 w-3 text-amber-500" />
          Electricity Due
        </span>
      );
    }

    if (status === 'Maintenance Due') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Wrench className="h-3 w-3 text-amber-500" />
          Maintenance Due
        </span>
      );
    }

    if (status === 'Electricity & Maint. Due') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-500 border border-orange-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
          Electricity & Maint. Due
        </span>
      );
    }

    if (status === 'Rent Due') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          Rent Due
        </span>
      );
    }

    if (status && status.includes('Due')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          {status}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
        Payment Due
      </span>
    );
  };

  const totalRent = rents.reduce((acc, r) => acc + (r.totalBilledAmount || r.amount || 0), 0);
  const totalCollected = rents.reduce((acc, r) => {
    const paidSum = (r.payments || []).reduce((pAcc, p) => pAcc + (p.amount || 0), 0);
    if (paidSum > 0) return acc + paidSum;
    if (r.status === 'Paid') return acc + (r.totalBilledAmount || r.amount || 0);
    return acc;
  }, 0);
  const totalPending = Math.max(0, totalRent - totalCollected);



  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <InvoiceModal
        rent={invoiceRent}
        hostel={selectedHostel}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceRent(null);
        }}
      />

      {/* Collect Payment Pop-up Modal */}
      {selectedRent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/30">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Record Rent Payment</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedRent.tenant?.name || 'Resident'} • Room {selectedRent.tenant?.bed?.room?.roomNumber || 'N/A'} (Bed {selectedRent.tenant?.bed?.bedNumber || 'N/A'}) • Cycle {selectedRent.month}/{selectedRent.year}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedRent(null)} 
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {showSuccess ? (
              <div className="p-10 flex flex-col items-center justify-center space-y-3 animate-in zoom-in">
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-14 w-14" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Payment Recorded</h3>
                <p className="text-xs text-muted-foreground">₹{paymentAmount} successfully updated in database</p>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Total Billed Summary */}
                <div className="flex justify-between items-center bg-muted/40 p-3.5 rounded-xl border border-border/60">
                  <div>
                    <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block">Total Billed Amount</span>
                    <span className="text-[11px] text-muted-foreground">Cycle {selectedRent.month}/{selectedRent.year}</span>
                  </div>
                  <span className="text-2xl font-extrabold text-amber-600">
                    ₹{(selectedRent.totalBilledAmount ?? ((selectedRent.rentAmount ?? selectedRent.tenant?.rentAmount ?? 0) + (selectedRent.electricityAmount ?? 0) + (selectedRent.maintenanceAmount ?? selectedRent.tenant?.maintenanceFee ?? 0))).toLocaleString()}
                  </span>
                </div>

                {/* Component Toggles */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment Components (Toggle to Include / Exclude)
                  </label>
                  <div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-border/60 divide-y divide-border/40">
                    {/* Room Rent */}
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Home className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Room Rent</p>
                          <p className="text-[10px] text-muted-foreground">Monthly accommodation charge</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-foreground">
                          ₹{(selectedRent.rentAmount ?? selectedRent.tenant?.rentAmount ?? 0).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !toggleRent;
                            setToggleRent(next);
                            updateCollectingAmount(next, toggleElectricity, toggleMaintenance);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            toggleRent ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              toggleRent ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Electricity Bill */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Electricity Bill</p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedRent.roomOccupiedBeds > 1
                              ? `Divided per bed (÷ ${selectedRent.roomOccupiedBeds} beds)`
                              : 'Meter reading consumption'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-foreground">
                          ₹{(selectedRent.electricityAmount ?? 0).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !toggleElectricity;
                            setToggleElectricity(next);
                            updateCollectingAmount(toggleRent, next, toggleMaintenance);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            toggleElectricity ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              toggleElectricity ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Maintenance Fee */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Maintenance Fee</p>
                          <p className="text-[10px] text-muted-foreground">Housekeeping, water & common amenities</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-foreground">
                          ₹{(selectedRent.maintenanceAmount ?? selectedRent.tenant?.maintenanceFee ?? 0).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !toggleMaintenance;
                            setToggleMaintenance(next);
                            updateCollectingAmount(toggleRent, toggleElectricity, next);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            toggleMaintenance ? 'bg-primary' : 'bg-muted-foreground/30'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              toggleMaintenance ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Collecting */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount Collecting (₹)
                  </label>
                  <Input 
                    type="number" 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)} 
                    className="text-lg font-bold h-11 rounded-xl bg-card"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'Cash', 'Bank'].map((m) => (
                      <Button 
                        key={m}
                        type="button"
                        variant={method === m ? 'default' : 'outline'}
                        onClick={() => setMethod(m)}
                        className="h-10 rounded-xl text-xs font-semibold"
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Reference ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reference / Transaction ID
                  </label>
                  <Input 
                    placeholder="UPI Ref ID or Cheque number"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="h-10 rounded-xl text-xs bg-card"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl h-10 text-xs font-medium" 
                    onClick={() => setSelectedRent(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl h-10 text-xs font-semibold shadow-sm" 
                    onClick={handleConfirmPayment}
                    disabled={submitting}
                  >
                    {submitting ? 'Recording...' : 'Confirm Payment'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Rent & Invoicing
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs rounded-full px-2.5 py-0.5">
              Cycle Billing
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {selectedHostel?.name || 'All Buildings'} • Monthly dues, rent receipts, payment tracking, and ledger history
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateMonthly}
            disabled={generating}
            className="h-9 rounded-lg text-xs gap-1.5 bg-card"
          >
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{generating ? 'Generating...' : 'Auto-Generate Bills'}</span>
          </Button>
        </div>
      </div>

      {/* Top HR KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <KpiCard
          title="Total Receivables"
          value={`₹${totalRent.toLocaleString()}`}
          change="Full billed amount"
          trend="neutral"
          subtitle="Selected period"
          progress={100}
          colorScheme="primary"
          icon={DollarSign}
        />
        <KpiCard
          title="Total Collected"
          value={`₹${totalCollected.toLocaleString()}`}
          change={totalRent > 0 ? `${Math.round((totalCollected / totalRent) * 100)}% collected` : '0%'}
          trend="up"
          subtitle="Settled receipts"
          progress={totalRent > 0 ? Math.round((totalCollected / totalRent) * 100) : 0}
          colorScheme="success"
          icon={CreditCard}
        />
        <KpiCard
          title="Pending Receivables"
          value={`₹${totalPending.toLocaleString()}`}
          change={totalPending > 0 ? 'Requires collection' : 'Fully cleared'}
          trend={totalPending > 0 ? 'down' : 'up'}
          subtitle="Outstanding invoices"
          progress={totalRent > 0 ? Math.round((totalPending / totalRent) * 100) : 0}
          colorScheme="warning"
          icon={AlertCircle}
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <AskAiSearchBox
            placeholder="Ask AI or search rent by resident, phone..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onSubmit={() => fetchRents()}
            context="rent"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 sm:flex gap-1.5 sm:gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-xl border border-border/80 bg-card px-2 sm:px-3 text-xs font-medium text-foreground outline-none cursor-pointer truncate"
          >
            <option value="All">All Invoices</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-xl border border-border/80 bg-card px-2 sm:px-3 text-xs font-medium text-foreground outline-none cursor-pointer truncate"
          >
            <option value="">Month</option>
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={m + 1}>M{m + 1}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-xl border border-border/80 bg-card px-2 sm:px-3 text-xs font-medium text-foreground outline-none cursor-pointer truncate"
          >
            <option value="">Year</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Modern Invoices Table */}
      <Card className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Loading rent ledgers and invoice status...</span>
            </div>
          ) : rents.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-muted/50 text-muted-foreground">
                <CreditCard className="h-8 w-8" />
              </div>
              <p className="font-semibold text-foreground text-sm">No rent records found</p>
              <p className="text-xs max-w-sm">No invoices match selected filters. You can click "Auto-Generate Bills" to bill active residents.</p>
              <Button size="sm" onClick={handleGenerateMonthly} className="rounded-lg text-xs mt-2">
                Generate Invoices Now
              </Button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-6">Resident</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Billing Cycle</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Electricity Bill</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Bill Amount</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Status</TableHead>
                      <TableHead className="text-xs font-semibold py-3 pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rents.map((rent) => (
                      <TableRow key={rent.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-xl border border-border/60">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${rent.tenant?.name || 'T'}`} />
                              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                                {(rent.tenant?.name || 'T').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-sm font-semibold text-foreground">{rent.tenant?.name || 'Tenant'}</span>
                              <span className="text-[11px] text-muted-foreground">
                                Room {rent.tenant?.bed?.room?.roomNumber || 'N/A'} • Bed {rent.tenant?.bed?.bedNumber || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs font-mono font-medium">
                          Cycle {rent.month}/{rent.year}
                        </TableCell>

                        {/* Electricity Bill Column */}
                        <TableCell className="py-3.5">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              ₹{(rent.electricityAmount || 0).toLocaleString()}
                            </span>
                            {rent.roomElectricityTotal > 0 ? (
                              <span className="text-[10px] text-muted-foreground">
                                Room ₹{rent.roomElectricityTotal.toLocaleString()} ÷ {rent.roomOccupiedBeds || 1} {rent.roomOccupiedBeds === 1 ? 'bed' : 'beds'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60">No reading</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-extrabold text-foreground">
                              ₹{(rent.totalBilledAmount || rent.amount || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {formatBreakdown(rent)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          {renderStatusBadge(rent.status)}
                        </TableCell>

                        <TableCell className="py-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenInvoice(rent)}
                              className="h-8 text-xs rounded-lg gap-1.5 font-medium"
                            >
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              <span>Invoice</span>
                            </Button>

                            {rent.status !== 'Paid' ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleCollectClick(rent)} 
                                className="h-8 text-xs rounded-lg font-semibold shadow-sm"
                              >
                                Collect
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground font-medium px-2">
                                ✓ Cleared
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE CARD LIST VIEW */}
              <div className="block md:hidden divide-y divide-border/60">
                {rents.map((rent) => (
                  <div key={rent.id} className="p-3.5 space-y-2.5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 rounded-xl border border-border/60 shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${rent.tenant?.name || 'T'}`} />
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                            {(rent.tenant?.name || 'T').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{rent.tenant?.name || 'Resident'}</span>
                          <span className="text-[11px] text-muted-foreground">
                            Cycle {rent.month}/{rent.year}
                          </span>
                        </div>
                      </div>

                      {renderStatusBadge(rent.status)}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Room {rent.tenant?.bed?.room?.roomNumber || 'N/A'} • Bed {rent.tenant?.bed?.bedNumber || 'N/A'}
                        </span>
                        <span className="text-[10px] text-amber-500 font-medium flex items-center gap-1 mt-0.5">
                          <Zap className="h-3 w-3" /> Elec: ₹{(rent.electricityAmount || 0).toLocaleString()}
                          {rent.roomOccupiedBeds > 1 ? ` (÷ ${rent.roomOccupiedBeds} beds)` : ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">Total Billed</span>
                        <div className="text-sm font-extrabold text-foreground">
                          ₹{(rent.totalBilledAmount || rent.amount || 0).toLocaleString()}
                        </div>
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          {formatBreakdown(rent)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInvoice(rent)}
                        className="flex-1 h-7 text-xs rounded-lg gap-1.5"
                      >
                        <FileText className="h-3 w-3 text-primary" />
                        <span>Invoice</span>
                      </Button>

                      {rent.status !== 'Paid' ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleCollectClick(rent)} 
                          className="flex-1 h-7 text-xs rounded-lg font-semibold shadow-sm"
                        >
                          Collect
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold px-2">
                          ✓ Settled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={totalRecords}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
