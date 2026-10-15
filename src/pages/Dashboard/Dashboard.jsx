import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mic, ArrowRight, AlertCircle, Plus, RefreshCw, Building2, Zap, CreditCard, Bed, Users, Send 
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBuilding } from '../../context/BuildingContext';
import { dashboardService } from '../../services';

export default function Dashboard() {
  const today = new Date();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedHostelId, selectedHostel } = useBuilding();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Natural Language Prompt Assistant input
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantReply, setAssistantReply] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const overviewData = await dashboardService.getOverview(selectedHostelId).catch(() => null);
      setOverview(overviewData);
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedHostelId]);

  const handleAssistantSubmit = (e) => {
    e?.preventDefault();
    if (!assistantQuery.trim()) return;

    const query = assistantQuery.toLowerCase();
    if (query.includes('rent') || query.includes('pending') || query.includes('due') || query.includes('money')) {
      setAssistantReply(`Total pending rent is ₹${(overview?.feeDues || 0).toLocaleString()}. Opening Rent collection...`);
      setTimeout(() => navigate('/rent'), 1200);
    } else if (query.includes('vacant') || query.includes('empty') || query.includes('room') || query.includes('bed')) {
      setAssistantReply(`There are ${overview?.vacantBeds || 0} vacant beds ready. Opening Vacancy view...`);
      setTimeout(() => navigate('/rooms'), 1200);
    } else if (query.includes('meter') || query.includes('electricity') || query.includes('light')) {
      setAssistantReply('Navigating to Electricity meter entry...');
      setTimeout(() => navigate('/electricity'), 1200);
    } else if (query.includes('add tenant') || query.includes('new tenant') || query.includes('register')) {
      setAssistantReply('Opening 3-step Tenant Enrollment Wizard...');
      setTimeout(() => navigate('/tenants/add'), 1200);
    } else if (query.includes('expense') || query.includes('bill') || query.includes('cost')) {
      setAssistantReply('Opening Expenses tracking...');
      setTimeout(() => navigate('/expenses'), 1200);
    } else {
      setAssistantReply(`Searching records for "${assistantQuery}"...`);
      setTimeout(() => navigate(`/tenants?search=${encodeURIComponent(assistantQuery)}`), 1200);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-24">
      
      {/* 1. HEADER SECTION (Greeting, Building Context, Sync) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Good Morning, {user?.name || 'Owner'}
          </h2>
          <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
            <Building2 className="h-4 w-4 text-primary" />
            <span>{selectedHostel?.name || 'All Properties'}</span>
            <span>•</span>
            <span>{format(today, 'dd MMMM yyyy')}</span>
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDashboardData} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Control Center</span>
        </Button>
      </div>

      {/* 2. CORE FOUR METRIC CARDS (Answering Occupancy & Pending Money) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card onClick={() => navigate('/rooms')} className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${overview?.occupiedBeds ?? 0} / ${overview?.totalBeds ?? 0}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview?.occupancyRate ?? '0%'} Capacity
            </p>
          </CardContent>
        </Card>
        
        <Card onClick={() => navigate('/rent')} className="border-l-4 border-l-warning cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rent</CardTitle>
            <CreditCard className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {loading ? '...' : `₹${(overview?.feeDues ?? 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Action needed</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/rooms')} className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacant Beds</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {loading ? '...' : (overview?.vacantBeds ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for check-in</p>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/reports')} className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `₹${(overview?.monthlyRevenue ?? 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Collections recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. TODAY'S ATTENTION FEED (Critical Action Center) */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center justify-between">
          <span>Today's Attention</span>
          <span className="text-xs text-muted-foreground font-normal">Real-time alerts</span>
        </h3>
        
        {loading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Checking operational alerts...</div>
        ) : !overview?.attention || overview.attention.length === 0 ? (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm flex items-center gap-2 font-medium">
            <AlertCircle className="h-4 w-4" /> All clear! No pending rent or operational alerts requiring attention.
          </div>
        ) : (
          <div className="space-y-2">
            {overview.attention.map((alertItem) => {
              const isCritical = alertItem.type === 'critical';
              const isWarning = alertItem.type === 'warning';

              return (
                <div 
                  key={alertItem.id}
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                    isCritical 
                      ? 'bg-destructive/10 border-destructive/25 text-destructive-foreground' 
                      : isWarning
                      ? 'bg-warning/10 border-warning/25 text-warning-foreground'
                      : 'bg-primary/10 border-primary/25 text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-5 w-5 shrink-0 ${
                      isCritical ? 'text-destructive' : isWarning ? 'text-warning' : 'text-primary'
                    }`} />
                    <span className="text-sm font-medium">{alertItem.title}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(alertItem.actionUrl)} 
                    className="h-8 font-semibold shrink-0"
                  >
                    {alertItem.actionLabel} ➔
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. QUICK ACTIONS GRID (Thumb-friendly touch targets) */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-14 justify-start px-4 text-sm font-medium" onClick={() => navigate('/tenants/add')}>
            <Plus className="mr-2 h-4 w-4 text-primary" /> Add Tenant
          </Button>
          <Button variant="outline" className="h-14 justify-start px-4 text-sm font-medium" onClick={() => navigate('/rent')}>
            <ArrowRight className="mr-2 h-4 w-4 text-primary" /> Collect Rent
          </Button>
          <Button variant="outline" className="h-14 justify-start px-4 text-sm font-medium" onClick={() => navigate('/electricity')}>
            <Zap className="mr-2 h-4 w-4 text-primary" /> Enter Meter
          </Button>
          <Button variant="outline" className="h-14 justify-start px-4 text-sm font-medium" onClick={() => navigate('/rooms')}>
            <Bed className="mr-2 h-4 w-4 text-primary" /> View Vacancies
          </Button>
        </div>
      </div>

      {/* 5. FLOATING ASSISTANT PROMPT BAR */}
      <div className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40">
        <form 
          onSubmit={handleAssistantSubmit}
          className="shadow-2xl rounded-full overflow-hidden bg-card border border-border/80 flex items-center p-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all"
        >
          <Mic className="h-4 w-4 text-primary ml-3 mr-1 shrink-0" />
          <input 
            type="text" 
            placeholder="Ask: 'Pending rent' or 'Vacant beds'..."
            value={assistantQuery}
            onChange={(e) => setAssistantQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm px-2 text-foreground placeholder:text-muted-foreground focus:ring-0"
          />
          <Button type="submit" size="sm" className="rounded-full h-8 px-3 text-xs gap-1">
            <span>Ask</span>
            <Send className="h-3 w-3" />
          </Button>
        </form>

        {assistantReply && (
          <div className="mt-2 bg-primary text-primary-foreground text-xs font-medium p-2.5 rounded-xl shadow-lg animate-in slide-in-from-bottom">
            {assistantReply}
          </div>
        )}
      </div>

    </div>
  );
}
