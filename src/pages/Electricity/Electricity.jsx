import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, AlertCircle, RefreshCw, History, Zap, Search, Calendar } from 'lucide-react';
import { electricityService, roomService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import Pagination from '../../components/Pagination';

export default function Electricity() {
  const { selectedHostelId, selectedHostel } = useBuilding();
  const [activeTab, setActiveTab] = useState('entry'); // 'entry' or 'history'

  // Entry states
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // History states
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyMonth, setHistoryMonth] = useState('');
  const [historyYear, setHistoryYear] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchRoomsForEntry = async () => {
    try {
      setLoading(true);
      const [readingsRes, roomsData] = await Promise.all([
        electricityService.getReadings({ hostelId: selectedHostelId }).catch(() => ({ readings: [] })),
        roomService.getRooms({ hostelId: selectedHostelId }).catch(() => [])
      ]);

      const previousReadings = readingsRes?.readings || (Array.isArray(readingsRes) ? readingsRes : []);

      // Build meter rows for rooms in this building
      const rows = (roomsData || []).map((r) => {
        const lastReading = previousReadings
          .filter((rd) => rd.roomId === r.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        const previousVal = lastReading ? lastReading.currentReading : 1000;
        const previousRate = lastReading ? lastReading.ratePerUnit || 8 : 8;

        return {
          roomId: r.id,
          roomNumber: r.roomNumber,
          floorName: r.floor?.name || '',
          previous: previousVal,
          current: '',
          rate: previousRate
        };
      });

      setReadings(rows);
    } catch (err) {
      console.error('Failed to load electricity entry data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await electricityService.getReadings({
        hostelId: selectedHostelId,
        search: historySearch,
        month: historyMonth || undefined,
        year: historyYear || undefined,
        page,
        limit: 10
      });

      setHistoryList(res.readings || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (err) {
      console.error('Failed to load electricity history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'entry') {
      fetchRoomsForEntry();
    } else {
      fetchHistory();
    }
  }, [selectedHostelId, activeTab, page, historyMonth, historyYear]);

  const handleCurrentChange = (index, value) => {
    const updated = [...readings];
    updated[index].current = value;
    setReadings(updated);
  };

  const handleRateChange = (index, value) => {
    const updated = [...readings];
    updated[index].rate = parseFloat(value) || 0;
    setReadings(updated);
  };

  const calculateUsage = (previous, current) => {
    if (!current) return 0;
    return parseFloat(current) - parseFloat(previous);
  };

  const handleSaveAll = async () => {
    setSubmitting(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      for (const meter of readings) {
        if (meter.current !== '') {
          const usage = calculateUsage(meter.previous, meter.current);
          if (usage >= 0) {
            const bill = usage * meter.rate;
            await electricityService.saveReading({
              roomId: meter.roomId,
              month: currentMonth,
              year: currentYear,
              previousReading: parseFloat(meter.previous),
              currentReading: parseFloat(meter.current),
              unitsConsumed: usage,
              ratePerUnit: parseFloat(meter.rate),
              billAmount: bill,
              netAmount: bill
            });
          }
        }
      }
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        fetchRoomsForEntry();
      }, 2000);
    } catch (err) {
      alert('Error saving electricity meter records: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20 max-w-4xl mx-auto">
      {/* HEADER WITH TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> Electricity & Meter Readings
          </h2>
          <p className="text-muted-foreground">
            {selectedHostel?.name || 'All Properties'} • Track units consumed, per-unit rate & net billing
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'entry' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('entry')}
          >
            Meter Entry
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTab('history');
              setPage(1);
            }}
          >
            <History className="h-4 w-4 mr-1" /> Bill History
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={activeTab === 'entry' ? fetchRoomsForEntry : fetchHistory}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${loading || historyLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {activeTab === 'entry' ? (
        /* ================= METER ENTRY VIEW ================= */
        loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading room meters for property...</div>
        ) : readings.length === 0 ? (
          <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground">
            No rooms found for {selectedHostel?.name || 'this property'}. Create rooms first.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {readings.map((meter, idx) => {
                const usage = calculateUsage(meter.previous, meter.current);
                const isInvalid = meter.current !== '' && usage < 0;
                const netAmount = usage > 0 ? usage * meter.rate : 0;

                return (
                  <Card key={meter.roomId} className={`overflow-hidden transition-colors ${isInvalid ? 'border-destructive' : 'border-border'}`}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Room & Previous */}
                        <div className="sm:col-span-3">
                          <p className="font-bold text-base text-foreground">Room {meter.roomNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {meter.floorName ? `${meter.floorName} • ` : ''}Prev: <span className="font-semibold text-foreground">{meter.previous}</span>
                          </p>
                        </div>

                        {/* Current Reading */}
                        <div className="sm:col-span-3">
                          <label className="text-[11px] font-medium text-muted-foreground">Current Reading</label>
                          <Input 
                            type="number" 
                            placeholder="Reading..." 
                            value={meter.current}
                            onChange={(e) => handleCurrentChange(idx, e.target.value)}
                            className={`text-base font-bold ${isInvalid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                          />
                        </div>

                        {/* Per Unit Rate */}
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-medium text-muted-foreground">Rate (₹/Unit)</label>
                          <Input 
                            type="number" 
                            step="0.5"
                            placeholder="8.0" 
                            value={meter.rate}
                            onChange={(e) => handleRateChange(idx, e.target.value)}
                            className="text-base font-semibold"
                          />
                        </div>

                        {/* Units & Net Amount */}
                        <div className="sm:col-span-4 bg-muted/40 p-2.5 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Units Consumed</p>
                            <p className="font-bold text-sm">
                              {usage > 0 ? `${usage} units` : '0 units'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Net Amount</p>
                            <p className="font-extrabold text-lg text-primary">₹{netAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {isInvalid && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Current meter reading cannot be lower than previous reading ({meter.previous}).
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="fixed bottom-16 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40">
              <Button 
                className="w-full h-14 text-lg shadow-xl" 
                onClick={handleSaveAll}
                disabled={submitting || isSaved || readings.every((m) => !m.current)}
              >
                {isSaved ? (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Saved to Database</>
                ) : submitting ? (
                  'Saving...'
                ) : (
                  'Save All Readings'
                )}
              </Button>
            </div>
          </div>
        )
      ) : (
        /* ================= BILL HISTORY VIEW ================= */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Room number..."
                className="pl-9 bg-card"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setPage(1);
                }}
                onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={historyMonth}
                onChange={(e) => {
                  setHistoryMonth(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="">All Months</option>
                {[...Array(12).keys()].map((m) => (
                  <option key={m + 1} value={m + 1}>
                    Month {m + 1}
                  </option>
                ))}
              </select>

              <select
                value={historyYear}
                onChange={(e) => {
                  setHistoryYear(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>

              <Button variant="outline" onClick={fetchHistory}>
                Filter
              </Button>
            </div>
          </div>

          {historyLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading electricity history...</div>
          ) : historyList.length === 0 ? (
            <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground">
              No historical meter bills found matching the selected filters.
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((bill) => (
                <div
                  key={bill.id}
                  className="p-4 bg-card rounded-lg border hover:border-primary/40 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <h4 className="font-bold text-base flex items-center gap-2">
                      Room {bill.room?.roomNumber || 'Unknown'}
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-normal">
                        Billing Cycle: {bill.month}/{bill.year}
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Readings: {bill.previousReading} ➔ {bill.currentReading} ({bill.unitsConsumed} units @ ₹{bill.ratePerUnit || 8}/unit)
                    </p>
                  </div>

                  <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="text-xs text-muted-foreground sm:order-1">Net Bill Amount</span>
                    <span className="text-lg font-bold text-primary sm:order-2">
                      ₹{(bill.netAmount || bill.billAmount || 0).toLocaleString()}
                    </span>
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
      )}
    </div>
  );
}
