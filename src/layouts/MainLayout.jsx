import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Bed, 
  CreditCard, 
  Zap, 
  FileText, 
  Settings, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  ChevronDown, 
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  Command,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBuilding } from '../context/BuildingContext';
import { useSocket } from '../context/SocketContext';
import BuildingModal from '../components/BuildingModal';
import { BrandLogo } from '../components/ui/Logo';
import AskAiSearchBox from '../components/AskAiSearchBox';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MainLayout() {
  const { user, logout, hasPermission } = useAuth();
  const { selectedHostel, hostels } = useBuilding();
  const navigate = useNavigate();
  const location = useLocation();

  const { isConnected, activeAlert, dismissAlert } = useSocket();
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('tavyn_theme') === 'dark';
  });

  // Sync theme
  useEffect(() => {
    if (localStorage.getItem('tavyn_theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tavyn_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tavyn_theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation schema categorized like Shadcn UI HR kit
  const navSections = [
    {
      title: 'Overview & Residents',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, key: 'dashboard', badge: 'Live' },
        { name: 'Residents', path: '/tenants', icon: Users, key: 'tenants' },
        { name: 'Rooms & Beds', path: '/rooms', icon: Bed, key: 'rooms' },
      ],
    },
    {
      title: 'Finance & Operations',
      items: [
        { name: 'Rent Collection', path: '/rent', icon: CreditCard, key: 'rent' },
        { name: 'Electricity Meters', path: '/electricity', icon: Zap, key: 'electricity' },
        { name: 'Expenses', path: '/expenses', icon: FileText, key: 'expenses' },
        { name: 'Financial Reports', path: '/reports', icon: FileText, key: 'reports' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { 
          name: 'Staff Management', 
          path: '/staff', 
          icon: UserCheck, 
          key: 'staff',
          allowedRoles: ['SUPER_ADMIN', 'HOSTEL_ADMIN'] 
        },
        { 
          name: 'Access Control', 
          path: '/access-control', 
          icon: ShieldCheck, 
          key: 'access_control',
          allowedRoles: ['SUPER_ADMIN'] 
        },
        { name: 'Settings', path: '/settings', icon: Settings, key: 'settings' },
      ],
    },
  ];

  // Helper to get breadcrumb label
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return { section: 'Dashboards', page: 'HR & Hostel Overview' };
    if (path.startsWith('/tenants')) return { section: 'Residents', page: path.includes('/add') ? 'Enroll Resident' : 'Resident Directory' };
    if (path.startsWith('/rooms')) return { section: 'Facilities', page: 'Rooms & Bed Allocations' };
    if (path.startsWith('/rent')) return { section: 'Finance', page: 'Rent & Ledger' };
    if (path.startsWith('/electricity')) return { section: 'Operations', page: 'Electricity Submeters' };
    if (path.startsWith('/expenses')) return { section: 'Finance', page: 'Hostel Expenses' };
    if (path.startsWith('/reports')) return { section: 'Analytics', page: 'Performance Reports' };
    if (path.startsWith('/staff')) return { section: 'Team', page: 'Staff & Roles' };
    if (path.startsWith('/access-control')) return { section: 'Security', page: 'Role Permissions' };
    if (path.startsWith('/settings')) return { section: 'Config', page: 'Hostel Settings' };
    return { section: 'Home', page: 'Overview' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <SidebarProvider defaultOpen={true}>
      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
      />

      {/* Floating real-time WebSocket alert */}
      {activeAlert && (
        <div 
          onClick={dismissAlert}
          className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top duration-300 cursor-pointer hover:opacity-95"
        >
          <Sparkles className="h-4 w-4 animate-spin text-amber-300 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-[10px] tracking-wider uppercase opacity-80">Real-time WebSocket</span>
            <span>{activeAlert.message}</span>
          </div>
        </div>
      )}

      {/* SHADCN INSET SIDEBAR */}
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" variant="dark" />
            <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
              <span className="font-bold text-base tracking-tight leading-tight flex items-center gap-1.5">
                TAVYN <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold uppercase">PRO</Badge>
              </span>
              <span className="text-xs text-muted-foreground truncate">Hostel Management Suite</span>
            </div>
          </div>

          {/* Quick Hostel Switcher Button */}
          <div className="mt-2 group-data-[collapsible=icon]:hidden">
            <button
              onClick={() => setIsBuildingModalOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground text-xs font-medium transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{selectedHostel?.name || 'All Properties'}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
            </button>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          {navSections.map((section) => {
            const filteredItems = section.items.filter((item) => {
              if (item.allowedRoles && !item.allowedRoles.includes(user?.role)) {
                return false;
              }
              if (item.key === 'settings') return true;
              return hasPermission(item.key);
            });

            if (filteredItems.length === 0) return null;

            return (
              <SidebarGroup key={section.title} className="py-1">
                <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase px-2">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredItems.map((item) => {
                      const isActive = item.path === '/' 
                        ? location.pathname === '/' 
                        : location.pathname.startsWith(item.path);

                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.name}
                            className={`rounded-lg transition-all h-9 px-2.5 ${
                              isActive 
                                ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                            }`}
                          >
                            <NavLink to={item.path} className="flex items-center gap-3 w-full">
                              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span className="text-sm truncate">{item.name}</span>
                              {item.badge && (
                                <SidebarMenuBadge className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0 rounded-full font-medium">
                                  {item.badge}
                                </SidebarMenuBadge>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        {/* SIDEBAR FOOTER: USER CARD & LOGOUT */}
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors text-left group-data-[collapsible=icon]:p-0">
                <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Owner'}`} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                    {(user?.name || 'OW').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 truncate group-data-[collapsible=icon]:hidden leading-tight">
                  <span className="text-xs font-semibold text-foreground truncate">{user?.name || 'Owner'}</span>
                  <span className="text-[11px] text-muted-foreground truncate">{user?.email || 'owner@tavyn.com'}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl">
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold leading-none text-foreground">{user?.name || 'Hostel Admin'}</p>
                  <p className="text-[11px] leading-none text-muted-foreground">{user?.email}</p>
                  <div className="pt-1">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {user?.role || 'HOSTEL_ADMIN'}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-xs cursor-pointer rounded-lg">
                <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsBuildingModalOpen(true)} className="text-xs cursor-pointer rounded-lg">
                <Building2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <span>Switch Property</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-xs text-destructive focus:text-destructive cursor-pointer rounded-lg font-medium">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* SHADCN INSET MAIN WORKSPACE */}
      <SidebarInset className="bg-background min-h-screen flex flex-col overflow-x-hidden">
        
        {/* TOP HEADER BAR (BREADCRUMB, SEARCH, STATUS, THEME, PROFILE) */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-3 sm:px-6 transition-all">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4 hidden sm:block" />

          {/* Mobile brand header */}
          <div className="flex md:hidden items-center gap-2">
            <BrandLogo size="sm" variant="dark" />
            <span className="font-extrabold text-sm tracking-tight text-foreground">TAVYN</span>
          </div>

          {/* Breadcrumb Navigation */}
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer text-xs font-medium">
                  {breadcrumb.section}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-semibold text-foreground">
                  {breadcrumb.page}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
            {/* Global Ask AI & Search Box */}
            <div className="relative hidden md:block w-64 lg:w-80">
              <AskAiSearchBox
                placeholder="Ask AI or search anything... ⌘K"
                context="global"
                size="sm"
                className="w-full"
              />
            </div>

            {/* Live Sync Status */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{isConnected ? 'WebSocket Live' : 'Connecting...'}</span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg relative text-muted-foreground hover:text-foreground"
              onClick={() => setLiveNotice('No unread notifications at this time.')}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
            </Button>

            <Separator orientation="vertical" className="h-4" />

            {/* User Avatar Action */}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-primary/20 transition-all"
            >
              <Avatar className="h-7 w-7 rounded-full">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Owner'}`} />
                <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-semibold">
                  {(user?.name || 'OW').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTENT OUTLET */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 pb-24 md:pb-12">
          <Outlet />
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR (FIXED DOCK FOR SMARTPHONES) */}
        <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
          <NavLink
            to="/"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/tenants"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4 mb-0.5" />
            <span>Tenants</span>
          </NavLink>

          {/* Quick Add FAB */}
          <NavLink
            to="/tenants/add"
            className="flex items-center justify-center -mt-5 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/35 active:scale-95 transition-all"
            title="Enroll Tenant"
          >
            <Plus className="h-5 w-5" />
          </NavLink>

          <NavLink
            to="/rent"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="h-4 w-4 mb-0.5" />
            <span>Rent</span>
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) => `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-all ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bed className="h-4 w-4 mb-0.5" />
            <span>Rooms</span>
          </NavLink>
        </nav>

      </SidebarInset>
    </SidebarProvider>
  );
}
