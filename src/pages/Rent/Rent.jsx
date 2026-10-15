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
  DollarSign
} from 'lucide-react';
import { financeService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import Pagination from '../../components/Pagination';
import InvoiceModal from '../../components/InvoiceModal';
import { KpiCard } from '../../components/dashboard/KpiCard';

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
      alert(res.message || 'Rent bills generated successfully');
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
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 animate-in zoom-in">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Payment Recorded</h2>
          <p className="text-xs text-muted-foreground">₹{paymentAmount} successfully updated in database</p>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto space-y-6 animate-in slide-in-from-right pb-20">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Record Rent Payment</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedRent.tenant?.name || 'Resident'} • Cycle {selectedRent.month}/{selectedRent.year}
          </p>
        </div>

        <Card className="rounded-2xl border border-border/80 bg-card shadow-lg overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl border border-border/60">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Invoice Balance</span>
              <span className="text-2xl font-extrabold text-amber-600">₹{selectedRent.amount.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount Received (₹)</label>
              <Input 
                type="number" 
                value={paymentAmount} 
                onChange={(e) => setPaymentAmount(e.target.value)} 
                className="text-lg font-bold h-11 rounded-xl bg-card"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</label>
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

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference / Transaction ID</label>
              <Input 
                placeholder="UPI Ref ID or Cheque number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-10 rounded-xl text-xs bg-card"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl h-10 text-xs font-medium" onClick={() => setSelectedRent(null)}>
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
          </CardContent>
        </Card>
      </div>
    );
  }

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

          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRents} 
            disabled={loading}
            className="h-9 rounded-lg text-xs gap-1.5 bg-card"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
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
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by resident name or phone..." 
            className="pl-9 h-9 rounded-xl text-xs bg-card border-border/80" 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onKeyDown={(e) => e.key === 'Enter' && fetchRents()}
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

                        <TableCell className="py-3.5">
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            ₹{(rent.amount || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5">
                          {rent.status === 'Paid' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              Paid & Settled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              Payment Due
                            </span>
                          )}
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

                      {rent.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Due
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Room {rent.tenant?.bed?.room?.roomNumber || 'N/A'} • Bed {rent.tenant?.bed?.bedNumber || 'N/A'}
                      </span>
                      <div className="text-xs font-extrabold text-foreground">
                        ₹{(rent.amount || 0).toLocaleString()}
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
