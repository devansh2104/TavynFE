import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Receipt, Search, Upload, RefreshCw, Building2, Bed } from 'lucide-react';
import { format } from 'date-fns';
import { financeService, roomService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import Pagination from '../../components/Pagination';

const categories = ['Electricity', 'Water', 'WiFi', 'Repair', 'Salary', 'Cleaning', 'Other'];

export default function Expenses() {
  const { selectedHostelId, selectedHostel } = useBuilding();

  const [scopeType, setScopeType] = useState('building'); // 'building' | 'room'
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [rooms, setRooms] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('Repair');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchRooms = async () => {
    if (!selectedHostelId) return;
    try {
      const data = await roomService.getRooms({ hostelId: selectedHostelId });
      setRooms(data || []);
      if (data && data.length > 0) {
        setSelectedRoomId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load rooms for expense assignment', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await financeService.getExpenses({
        hostelId: selectedHostelId,
        category: filterCategory !== 'All' ? filterCategory : undefined,
        search,
        page,
        limit: 10
      });
      setExpenses(res.expenses || []);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedHostelId]);

  useEffect(() => {
    fetchExpenses();
  }, [selectedHostelId, filterCategory, page]);

  const handleSave = async () => {
    if (!selectedHostelId || !amount || !selectedCategory) return;
    setSubmitting(true);
    try {
      await financeService.createExpense({
        hostelId: selectedHostelId,
        roomId: scopeType === 'room' ? selectedRoomId : null,
        category: selectedCategory,
        amount: parseFloat(amount),
        description: description || null,
        date: new Date(date).toISOString()
      });
      setShowSuccess(true);
      setAmount('');
      setDescription('');
      setTimeout(() => {
        setShowSuccess(false);
        fetchExpenses();
      }, 1500);
    } catch (err) {
      alert('Failed to record expense: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Expenses</h2>
          <p className="text-muted-foreground">
            {selectedHostel?.name || 'All Buildings'} • Track building-wide and room-specific operational costs
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchExpenses} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ADD EXPENSE FORM */}
        <Card className="border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in">
                <CheckCircle2 className="h-16 w-16 text-success" />
                <h3 className="text-xl font-bold">Expense Saved in MySQL</h3>
                <p className="text-muted-foreground">
                  Recorded {scopeType === 'room' ? 'for specific Room' : 'for Entire Building'}
                </p>
              </div>
            ) : (
              <>
                {/* SCOPE TOGGLE: Building vs Specific Room */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expense Scope</label>
                  <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
                    <Button
                      type="button"
                      variant={scopeType === 'building' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setScopeType('building')}
                      className="gap-2"
                    >
                      <Building2 className="h-4 w-4" /> Building-Wide
                    </Button>
                    <Button
                      type="button"
                      variant={scopeType === 'room' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setScopeType('room')}
                      className="gap-2"
                    >
                      <Bed className="h-4 w-4" /> Specific Room
                    </Button>
                  </div>
                </div>

                {scopeType === 'room' && (
                  <div className="space-y-2 animate-in fade-in">
                    <label className="text-sm font-medium">Select Room</label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {rooms.length === 0 ? (
                        <option value="">No rooms available</option>
                      ) : (
                        rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            Room {r.roomNumber} ({r.floor?.name || 'Floor'})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {/* CATEGORIES */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat)}
                        className="rounded-full text-xs h-8"
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (₹) *</label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input 
                    placeholder="e.g. Geyser switch repair, generator oil" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center space-y-1 hover:bg-muted/50 transition-colors cursor-pointer">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload Receipt / Bill</p>
                  <p className="text-xs text-muted-foreground">Optional receipt copy</p>
                </div>
                
                <Button 
                  className="w-full h-12 text-base mt-2" 
                  disabled={!selectedCategory || !amount || submitting}
                  onClick={handleSave}
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* EXPENSE HISTORY WITH FILTER & PAGINATION */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search descriptions..." 
                className="pl-9 bg-card" 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                onKeyDown={(e) => e.key === 'Enter' && fetchExpenses()}
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-input bg-card px-3 text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground">
              No expenses recorded for this building yet.
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{expense.category}</h4>
                        {expense.room ? (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                            Room {expense.room.roomNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                            Building-Wide
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{expense.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base text-destructive">₹{(expense.amount || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {expense.date ? format(new Date(expense.date), 'dd MMM yyyy') : 'Recent'}
                    </p>
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
        
      </div>
    </div>
  );
}
