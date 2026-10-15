import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle2, RefreshCw, Calendar, FileText } from 'lucide-react';
import { financeService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import Pagination from '../../components/Pagination';
import InvoiceModal from '../../components/InvoiceModal';

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

  const fetchRents = async () => {
    try {
      setLoading(true);
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

  const handleGenerateMonthly = async () => {
    if (!selectedHostelId) return;
    const now = new Date();
    const curM = now.getMonth() + 1;
    const curY = now.getFullYear();
    setGenerating(true);
    try {
      const res = await financeService.generateMonthlyRent(curM, curY, selectedHostelId);
      alert(res.message || 'Rent bills generated');
      fetchRents();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCollectClick = (rent) => {
    setSelectedRent(rent);
    setPaymentAmount(rent.amount.toString());
  };

  const handleOpenInvoice = (rent) => {
    setInvoiceRent(rent);
    setIsInvoiceOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedRent) return;
    setSubmitting(true);
    try {
      await financeService.recordPayment({
        tenantId: selectedRent.tenantId,
        rentId: selectedRent.id,
        amount: parseFloat(paymentAmount) || 0,
        method,
        referenceId: reference || null
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

  const totalRent = rents.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalCollected = rents.filter((r) => r.status === 'Paid').reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalPending = totalRent - totalCollected;

  if (selectedRent) {
    if (showSuccess) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in zoom-in">
          <CheckCircle2 className="h-16 w-16 text-success" />
          <h2 className="text-2xl font-bold">Payment Recorded</h2>
          <p className="text-muted-foreground">₹{paymentAmount} successfully updated in database</p>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-right">
        <div>
          <h2 className="text-2xl font-bold">Collect Rent Payment</h2>
          <p className="text-muted-foreground">
            {selectedRent.tenant?.name || 'Tenant'} • Month {selectedRent.month}/{selectedRent.year}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
              <span className="font-medium text-sm">Bill Amount</span>
              <span className="text-xl font-bold text-destructive">₹{selectedRent.amount}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Amount (₹)</label>
              <Input 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'Cash', 'Bank'].map((m) => (
                  <Button 
                    key={m}
                    type="button"
                    variant={method === m ? 'default' : 'outline'}
                    onClick={() => setMethod(m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reference (Optional)</label>
              <Input 
                placeholder="UPI Ref ID or Transaction number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedRent(null)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-success hover:bg-success/90" 
                onClick={handleConfirmPayment}
                disabled={submitting}
              >
                {submitting ? 'Recording...' : 'Confirm Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Professional Tax Invoice Modal */}
      <InvoiceModal
        rent={invoiceRent}
        hostel={selectedHostel}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceRent(null);
        }}
      />

      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Rent & Monthly Bills</h2>
          <p className="text-muted-foreground">
            {selectedHostel?.name || 'All Buildings'} • Monthly recurring receivables, history & collection
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateMonthly}
            disabled={generating}
            className="gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate Month Bills'}
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchRents} disabled={loading} className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">₹{totalRent.toLocaleString()}</div>
            <p className="text-sm opacity-80 mt-1">Total Receivables</p>
          </CardContent>
        </Card>
        <Card className="border-success bg-success/5">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success">₹{totalCollected.toLocaleString()}</div>
            <p className="text-sm text-success/80 mt-1">Total Collected</p>
          </CardContent>
        </Card>
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-destructive">₹{totalPending.toLocaleString()}</div>
            <p className="text-sm text-destructive/80 mt-1">Pending Balance</p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tenant name or phone..." 
            className="pl-9 bg-card" 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onKeyDown={(e) => e.key === 'Enter' && fetchRents()}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>

          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="">All Months</option>
            {[...Array(12).keys()].map((m) => (
              <option key={m + 1} value={m + 1}>Month {m + 1}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-card px-3 text-sm"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* RENT INVOICES LIST */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading rent records...</div>
      ) : rents.length === 0 ? (
        <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground">
          No rent bills found matching the selected filters. Click "Generate Month Bills" to create bills for active tenants.
        </div>
      ) : (
        <div className="space-y-3">
          {rents.map((rent) => (
            <div key={rent.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors gap-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {rent.tenant?.name || 'Tenant Bill'}
                  <span className="text-xs font-normal text-muted-foreground">
                    • Room {rent.tenant?.bed?.room?.roomNumber || 'N/A'} (Bed {rent.tenant?.bed?.bedNumber || 'N/A'})
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Billing Cycle: <span className="font-medium text-foreground">{rent.month}/{rent.year}</span> • Phone: {rent.tenant?.phone || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="font-bold text-lg">₹{(rent.amount || 0).toLocaleString()}</p>
                  <p className={`text-xs font-bold ${rent.status === 'Paid' ? 'text-success' : 'text-warning'}`}>
                    {rent.status}
                  </p>
                </div>

                {/* Professional Invoice Preview & Print Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenInvoice(rent)}
                  className="gap-1 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-primary" /> Invoice
                </Button>

                {rent.status !== 'Paid' ? (
                  <Button onClick={() => handleCollectClick(rent)} className="bg-primary">
                    Collect
                  </Button>
                ) : (
                  <span className="text-xs bg-success/10 text-success font-semibold px-3 py-1.5 rounded-md">
                    Settled
                  </span>
                )}
              </div>
            </div>
          ))}

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
