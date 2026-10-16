import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Printer, Download, Share2, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function InvoiceModal({ rent, hostel, isOpen, onClose }) {
  if (!isOpen || !rent) return null;

  const invoiceNumber = `INV-${rent.year}${String(rent.month).padStart(2, '0')}-${rent.id.substring(0, 6).toUpperCase()}`;
  const invoiceDate = rent.generatedAt ? new Date(rent.generatedAt) : new Date();
  
  // Breakdown calculations
  const baseRent = rent.rentAmount ?? rent.tenant?.rentAmount ?? (rent.amount - (rent.tenant?.maintenanceFee || 0));
  const electricity = rent.electricityAmount ?? 0;
  const maintenance = rent.maintenanceAmount ?? rent.tenant?.maintenanceFee ?? 0;
  const lateFee = rent.lateFee || 0;
  const totalAmount = rent.totalBilledAmount ?? (baseRent + electricity + maintenance + lateFee);

  const isPaid = rent.status === 'Paid';
  const isPartial = rent.status && rent.status.includes('Due') && rent.status !== 'Payment Due' && rent.status !== 'Pending';
  const paymentRecord = rent.payments && rent.payments.length > 0 ? rent.payments[0] : null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `TAVYN Rent Invoice\nInvoice: ${invoiceNumber}\nTenant: ${rent.tenant?.name}\nRoom: ${rent.tenant?.bed?.room?.roomNumber || 'N/A'}\nMonth: ${rent.month}/${rent.year}\nRoom Rent: ₹${baseRent}\nElectricity: ₹${electricity}\nMaintenance: ₹${maintenance}\nTotal Billed: ₹${totalAmount}\nStatus: ${rent.status}`;
    navigator.clipboard?.writeText(text);
    alert('Invoice details copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-card border rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between p-4 bg-muted/60 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice Preview</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isPaid ? 'bg-success/20 text-success' : isPartial ? 'bg-amber-500/20 text-amber-500' : 'bg-warning/20 text-warning'
            }`}>
              {rent.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-1 text-xs h-8">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1 text-xs h-8 bg-primary">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-10 bg-card text-foreground font-sans space-y-8" id="invoice-sheet">
          
          {/* 1. BRAND & HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-lg tracking-wider">
                  T
                </div>
                <h1 className="text-2xl font-black tracking-tight text-primary">TAVYN</h1>
              </div>
              <p className="text-sm font-semibold text-foreground mt-2">{hostel?.name || 'TAVYN Residency'}</p>
              <p className="text-xs text-muted-foreground">{hostel?.address || 'Premium Student & Working Professionals Living'}</p>
            </div>

            <div className="text-left sm:text-right">
              <h2 className="text-xl font-bold tracking-tight text-foreground">TAX INVOICE</h2>
              <p className="text-xs font-mono font-semibold text-muted-foreground mt-1">{invoiceNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Date: <span className="font-medium text-foreground">{format(invoiceDate, 'dd MMMM yyyy')}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Billing Cycle: <span className="font-semibold text-foreground">Month {rent.month}/{rent.year}</span>
              </p>
            </div>
          </div>

          {/* 2. TENANT & ALLOCATION DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border border-border/60">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Billed To</p>
              <p className="text-base font-bold text-foreground mt-1">{rent.tenant?.name || 'Resident'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Phone: {rent.tenant?.phone || 'N/A'}</p>
              {rent.tenant?.email && (
                <p className="text-xs text-muted-foreground">Email: {rent.tenant.email}</p>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Property & Accommodation</p>
              <p className="text-sm font-bold text-foreground mt-1">
                Room {rent.tenant?.bed?.room?.roomNumber || 'N/A'} • Bed {rent.tenant?.bed?.bedNumber || 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {rent.tenant?.bed?.room?.floor?.name || 'Residential Floor'}
              </p>
              <p className="text-xs text-muted-foreground">
                Tenure: {rent.tenant?.tenureMonths || 11} Months
              </p>
            </div>
          </div>

          {/* 3. ITEMIZATION TABLE */}
          <div>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-1">Description</th>
                  <th className="py-3 text-center">Period</th>
                  <th className="py-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="py-3.5 px-1">
                    <p className="font-semibold text-foreground">Monthly Accommodation & Room Rent</p>
                    <p className="text-xs text-muted-foreground">Base accommodation fee for room allocation</p>
                  </td>
                  <td className="py-3.5 text-center text-xs text-muted-foreground font-medium">
                    {rent.month}/{rent.year}
                  </td>
                  <td className="py-3.5 text-right font-semibold">
                    ₹{baseRent.toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-1">
                    <p className="font-semibold text-foreground">Electricity Meter Bill (Current Cycle)</p>
                    <p className="text-xs text-muted-foreground">
                      {rent.roomElectricityTotal > 0
                        ? `Room ${rent.tenant?.bed?.room?.roomNumber || ''} total ₹${rent.roomElectricityTotal.toLocaleString()} divided among ${rent.roomOccupiedBeds || 1} occupied bed(s)`
                        : 'Current cycle electricity meter consumption'}
                    </p>
                  </td>
                  <td className="py-3.5 text-center text-xs text-muted-foreground font-medium">
                    {rent.month}/{rent.year}
                  </td>
                  <td className="py-3.5 text-right font-semibold">
                    ₹{electricity.toLocaleString()}
                  </td>
                </tr>

                {maintenance > 0 && (
                  <tr>
                    <td className="py-3.5 px-1">
                      <p className="font-semibold text-foreground">Facility & Maintenance Charge</p>
                      <p className="text-xs text-muted-foreground">Common housekeeping, security, water & WiFi</p>
                    </td>
                    <td className="py-3.5 text-center text-xs text-muted-foreground font-medium">
                      {rent.month}/{rent.year}
                    </td>
                    <td className="py-3.5 text-right font-semibold">
                      ₹{maintenance.toLocaleString()}
                    </td>
                  </tr>
                )}

                {lateFee > 0 && (
                  <tr>
                    <td className="py-3 px-1 text-destructive">
                      <p className="font-semibold">Late Payment Fee</p>
                      <p className="text-xs opacity-80">Overdue cycle penalty</p>
                    </td>
                    <td className="py-3 text-center text-xs text-muted-foreground font-medium">
                      Cycle {rent.month}
                    </td>
                    <td className="py-3 text-right font-semibold text-destructive">
                      ₹{lateFee.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. TOTALS & STATUS BADGE */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t">
            {/* Status Stamp */}
            <div className="flex items-center gap-3">
              {isPaid ? (
                <div className="border-2 border-success/40 bg-success/10 text-success p-3 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest">PAID IN FULL</p>
                    {paymentRecord && (
                      <p className="text-[11px] text-success/80">
                        Via {paymentRecord.method} {paymentRecord.referenceId ? `(${paymentRecord.referenceId})` : ''} on {format(new Date(paymentRecord.date), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ) : isPartial ? (
                <div className="border-2 border-amber-500/40 bg-amber-500/10 text-amber-600 p-3 rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest">{rent.status.toUpperCase()}</p>
                    <p className="text-[11px] text-amber-600/80">Partial collection recorded. Remaining balance pending.</p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-warning/40 bg-warning/10 text-warning p-3 rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="h-6 w-6 text-warning shrink-0" />
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest">PAYMENT DUE</p>
                    <p className="text-[11px] text-warning/80">Pending settlement via UPI, Cash, or Bank transfer</p>
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Room Rent</span>
                <span className="font-semibold text-foreground">₹{baseRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Electricity Bill</span>
                <span className="font-semibold text-foreground">₹{electricity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Maintenance Fee</span>
                <span className="font-semibold text-foreground">₹{maintenance.toLocaleString()}</span>
              </div>
              {lateFee > 0 && (
                <div className="flex justify-between text-xs text-destructive">
                  <span>Late Fee</span>
                  <span className="font-semibold">₹{lateFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-foreground border-t pt-2">
                <span>Total Amount Due</span>
                <span className="text-primary text-xl">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 5. FOOTER & INSTRUCTIONS */}
          <div className="border-t pt-6 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Terms & Payment Instructions:</p>
            <p>1. Payments are due by the 5th of each calendar month.</p>
            <p>2. Accepted methods: UPI, NetBanking, or authorized hostel management cash receipts.</p>
            <p>3. This is a computer-generated tax invoice issued by {hostel?.name || 'TAVYN Property Management'} and requires no physical signature.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
