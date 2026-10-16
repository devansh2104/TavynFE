import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Users, 
  Bed, 
  CreditCard, 
  Zap, 
  Plus, 
  ArrowUpRight, 
  AlertCircle, 
  Download, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  UserPlus, 
  Layers,
  PhoneCall,
  Clock,
  Radio,
  Activity,
  Wifi,
  WifiOff,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBuilding } from '../../context/BuildingContext';
import { dashboardService } from '../../services';

import { KpiCard } from '../../components/dashboard/KpiCard';
import { OccupancyChart } from '../../components/dashboard/OccupancyChart';
import { ResidentsTable } from '../../components/dashboard/ResidentsTable';
import { NoticesWidget } from '../../components/dashboard/NoticesWidget';
import { RealtimeFeedWidget } from '../../components/dashboard/RealtimeFeedWidget';
import { useSocket } from '../../context/SocketContext';
import { useAutoSync } from '../../hooks/useAutoSync';
import AskAiSearchBox from '../../components/AskAiSearchBox';

export default function Dashboard() {
  const today = new Date();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedHostelId, selectedHostel } = useBuilding();

  const { isConnected, lastEvent, eventLog, sendPing } = useSocket();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveBanner, setLiveBanner] = useState(null);
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState(new Date());

  // Natural Language Prompt Assistant input
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantReply, setAssistantReply] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const overviewData = await dashboardService.getOverview(selectedHostelId).catch(() => null);
      setOverview(overviewData);
      setLastLiveSyncTime(new Date());
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

  useAutoSync(fetchDashboardData, { enableSocket: false });

  // Real-time WebSocket listener: auto-refresh metrics without page reload
  useEffect(() => {
    if (lastEvent) {
      console.log('⚡ [Dashboard] Real-time WebSocket event received, re-syncing metrics:', lastEvent);
      setLiveBanner(lastEvent);
      fetchDashboardData();

      const timer = setTimeout(() => {
        setLiveBanner(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [lastEvent]);

  const handleAssistantSubmit = (e) => {
    e?.preventDefault();
    if (!assistantQuery.trim()) return;

    const query = assistantQuery.toLowerCase();
    if (query.includes('rent') || query.includes('pending') || query.includes('due') || query.includes('money')) {
      setAssistantReply(`Total pending rent is ₹${(overview?.feeDues || 0).toLocaleString()}. Navigating to Rent collection...`);
      setTimeout(() => navigate('/rent'), 1200);
    } else if (query.includes('vacant') || query.includes('empty') || query.includes('room') || query.includes('bed')) {
      setAssistantReply(`There are ${overview?.vacantBeds || 0} vacant beds ready. Navigating to Vacancy view...`);
      setTimeout(() => navigate('/rooms'), 1200);
    } else if (query.includes('meter') || query.includes('electricity') || query.includes('light')) {
      setAssistantReply('Navigating to Electricity meter entry...');
      setTimeout(() => navigate('/electricity'), 1200);
    } else if (query.includes('add tenant') || query.includes('new tenant') || query.includes('register')) {
      setAssistantReply('Opening 3-step Resident Enrollment Wizard...');
      setTimeout(() => navigate('/tenants/add'), 1200);
    } else if (query.includes('expense') || query.includes('bill') || query.includes('cost')) {
      setAssistantReply('Opening Expenses tracking...');
      setTimeout(() => navigate('/expenses'), 1200);
    } else {
      setAssistantReply(`Searching records for "${assistantQuery}"...`);
      setTimeout(() => navigate(`/tenants?search=${encodeURIComponent(assistantQuery)}`), 1200);
    }
  };

  const occupancyPercent = overview?.totalBeds > 0 
    ? Math.round(((overview?.occupiedBeds || 0) / overview.totalBeds) * 100) 
    : 0;

  // Big Quick Action Cards Definition
  const quickActions = [
    {
      title: 'Enroll Resident',
      subtitle: '3-step check-in wizard & bed allocation',
      icon: UserPlus,
      path: '/tenants/add',
      tag: 'Fast Check-in',
      color: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
      borderHover: 'hover:border-primary/50'
    },
    {
      title: 'Collect Rent',
      subtitle: 'Record dues, UPI receipts & settlements',
      icon: CreditCard,
      path: '/rent',
      tag: 'Accounting',
      color: 'bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      borderHover: 'hover:border-amber-500/50'
    },
    {
      title: 'Electricity Meters',
      subtitle: 'Log submeter units & auto-calc tariffs',
      icon: Zap,
      path: '/electricity',
      tag: 'Utility',
      color: 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
      borderHover: 'hover:border-indigo-500/50'
    },
    {
      title: 'Rooms & Beds',
      subtitle: 'Inspect floor plans & vacant inventory',
      icon: Bed,
      path: '/rooms',
      tag: 'Inventory',
      color: 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      borderHover: 'hover:border-emerald-500/50'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* 1. TOP HERO TITLE SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Hostel Operations & HR
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span>Welcome, <strong className="text-foreground">{user?.name || 'Administrator'}</strong></span>
            <span>•</span>
            <span className="font-medium text-foreground">{selectedHostel?.name || 'All Properties'}</span>
          </p>
        </div>

        {/* Ask AI & Search Box */}
        <div className="relative w-full sm:w-auto sm:min-w-[320px] md:min-w-[360px] lg:min-w-[420px]">
          <AskAiSearchBox
            placeholder="Ask AI or search: 'Vacant beds', 'Pending rent', residents..."
            context="dashboard"
            onSubmit={(query) => {
              if (!query) return;
              const lower = query.toLowerCase();
              if (lower.includes('rent') || lower.includes('pending') || lower.includes('due') || lower.includes('money')) {
                navigate('/rent');
              } else if (lower.includes('vacant') || lower.includes('empty') || lower.includes('room') || lower.includes('bed')) {
                navigate('/rooms');
              } else if (lower.includes('meter') || lower.includes('electricity') || lower.includes('light')) {
                navigate('/electricity');
              } else if (lower.includes('add tenant') || lower.includes('new tenant') || lower.includes('enroll') || lower.includes('register')) {
                navigate('/tenants/add');
              } else if (lower.includes('expense') || lower.includes('bill') || lower.includes('cost')) {
                navigate('/expenses');
              } else {
                navigate(`/tenants?search=${encodeURIComponent(query)}`);
              }
            }}
            className="w-full"
          />
        </div>
      </div>

      {/* Broadcast UI banner commented out per preference */}
      {/* {liveBanner && (
        <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-primary/10 border border-primary/25 shadow-sm text-xs animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">Live WebSocket Update</span>
                <span className="text-[10px] bg-primary/20 text-primary font-semibold px-1.5 py-0 rounded-full">Auto-Synced</span>
              </div>
              <p className="text-muted-foreground mt-0.5">{liveBanner.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
              {format(new Date(liveBanner.timestamp || new Date()), 'HH:mm:ss')}
            </span>
            <button 
              onClick={() => setLiveBanner(null)} 
              className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-md hover:bg-muted"
            >
              ✕
            </button>
          </div>
        </div>
      )} */}

      {/* 2. BIG HORIZONTAL QUICK ACTION CARDS (JUST BELOW TITLE) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Quick Operations
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {quickActions.map((action) => (
            <div
              key={action.title}
              onClick={() => navigate(action.path)}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card p-3 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] sm:min-h-[145px] ${action.borderHover}`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-2xl transition-all duration-200 shrink-0 ${action.color}`}>
                  <action.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="hidden sm:inline-block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/60 px-2 py-0.5 rounded-full group-hover:bg-accent transition-colors">
                    {action.tag}
                  </span>
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-muted/40 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-all ml-1">
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>

              <div className="mt-2.5 sm:mt-4">
                <h3 className="text-sm sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                  {action.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {action.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CORE FOUR SHADCN KPI METRIC CARDS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            Live Analytics
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <KpiCard
            title="Total Bed Occupancy"
            value={loading ? '...' : `${overview?.occupiedBeds ?? 0} / ${overview?.totalBeds ?? 0}`}
            change={`${occupancyPercent}% capacity`}
            trend={occupancyPercent > 75 ? 'up' : 'neutral'}
            subtitle={`${overview?.vacantBeds ?? 0} beds available`}
            progress={occupancyPercent}
            colorScheme="primary"
            icon={Bed}
            onClick={() => navigate('/rooms')}
          />

          <KpiCard
            title="Pending Rent Dues"
            value={loading ? '...' : `₹${(overview?.feeDues ?? 0).toLocaleString()}`}
            change={overview?.feeDues > 0 ? 'Action needed' : 'All clear'}
            trend={overview?.feeDues > 0 ? 'down' : 'up'}
            subtitle="Collected vs Outstandings"
            progress={overview?.feeDues > 0 ? 65 : 100}
            colorScheme="warning"
            icon={CreditCard}
            onClick={() => navigate('/rent')}
          />

          <KpiCard
            title="Vacant Beds Ready"
            value={loading ? '...' : (overview?.vacantBeds ?? 0)}
            change="Available for check-in"
            trend="up"
            subtitle="Across all room tiers"
            progress={overview?.totalBeds > 0 ? Math.round(((overview?.vacantBeds || 0) / overview.totalBeds) * 100) : 0}
            colorScheme="success"
            icon={Users}
            onClick={() => navigate('/rooms')}
          />

          <KpiCard
            title="Monthly Collections"
            value={loading ? '...' : `₹${(overview?.monthlyRevenue ?? 0).toLocaleString()}`}
            change="+8.5% vs last cycle"
            trend="up"
            subtitle="Current billing cycle"
            progress={88}
            colorScheme="indigo"
            icon={Zap}
            onClick={() => navigate('/reports')}
          />
        </div>
      </div>

      {/* 4. SHADCN TABS INTERFACE */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between pb-1">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex bg-muted/70 p-1 rounded-xl h-9 sm:h-10">
            <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm px-2 sm:px-4">
              Overview
            </TabsTrigger>
            <TabsTrigger value="occupancy" className="rounded-lg text-xs sm:text-sm px-2 sm:px-4">
              Wing Occupancy
            </TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg text-xs sm:text-sm px-2 sm:px-4 truncate">
              Alerts {overview?.attention?.length > 0 && `(${overview.attention.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLUMNS (CHART + DIRECTORY) */}
            <div className="lg:col-span-2 space-y-6">
              <OccupancyChart />
              <ResidentsTable />
            </div>

            {/* RIGHT 1 COLUMN (HOSTEL SNAPSHOT & METRICS) */}
            <div className="space-y-6">
              
              {/* Notice board and broadcast widgets commented out per user request */}
              {/* <RealtimeFeedWidget /> */}
              {/* <NoticesWidget /> */}

              {/* Property Snapshot Card */}
              <Card className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Property Overview
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Property Name</span>
                    <span className="font-semibold text-foreground">{selectedHostel?.name || 'TAVYN Heights'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Manager</span>
                    <span className="font-semibold text-foreground">{user?.name || 'Administrator'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Occupancy Status</span>
                    <span className="font-semibold text-primary">{occupancyPercent}% Occupied</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-muted-foreground">WebSocket Sync</span>
                    <span className={`inline-flex items-center gap-1.5 font-medium ${isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      {isConnected ? 'Real-Time Active' : 'Connecting...'}
                    </span>
                  </div>
                </div>
              </Card>

            </div>

          </div>
        </TabsContent>

        {/* TAB 2: WING OCCUPANCY */}
        <TabsContent value="occupancy" className="space-y-6 mt-0">
          <OccupancyChart />
          <ResidentsTable />
        </TabsContent>

        {/* TAB 3: ACTION ALERTS */}
        <TabsContent value="alerts" className="space-y-6 mt-0">
          <div className="space-y-6">
            {/* Broadcast feed commented out */}
            {/* <RealtimeFeedWidget /> */}

            <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Active Operational Alerts</h3>
                <p className="text-xs text-muted-foreground">Pending rent collections, vacate notices, and maintenance tasks</p>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Checking alerts...</div>
              ) : !overview?.attention || overview.attention.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  All operational items are up to date! No pending alerts.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {overview.attention.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground">Requires administrator review</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(item.actionUrl)}
                        className="h-8 text-xs font-medium rounded-lg"
                      >
                        {item.actionLabel}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
