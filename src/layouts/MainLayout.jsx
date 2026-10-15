import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Bed, CreditCard, Zap, FileText, Settings, PlusCircle, MoreHorizontal, LogOut, Building2, ChevronDown, UserCheck, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBuilding } from '../context/BuildingContext';
import BuildingModal from '../components/BuildingModal';
import { io } from 'socket.io-client';

const allDesktopNav = [
  { name: 'Home', path: '/', icon: Home, key: 'dashboard' },
  { name: 'Tenants', path: '/tenants', icon: Users, key: 'tenants' },
  { name: 'Rooms', path: '/rooms', icon: Bed, key: 'rooms' },
  { name: 'Rent', path: '/rent', icon: CreditCard, key: 'rent' },
  { name: 'Electricity', path: '/electricity', icon: Zap, key: 'electricity' },
  { name: 'Expenses', path: '/expenses', icon: FileText, key: 'expenses' },
  { name: 'Reports', path: '/reports', icon: FileText, key: 'reports' },
  { name: 'Staff', path: '/staff', icon: UserCheck, key: 'staff' },
  { name: 'Access Control', path: '/access-control', icon: ShieldCheck, key: 'access_control' },
  { name: 'Settings', path: '/settings', icon: Settings, key: 'settings' },
];

const allMobileNav = [
  { name: 'Home', path: '/', icon: Home, key: 'dashboard' },
  { name: 'Rooms', path: '/rooms', icon: Bed, key: 'rooms' },
  { name: 'Add', path: '/add', icon: PlusCircle, key: 'tenants' },
  { name: 'Rent', path: '/rent', icon: CreditCard, key: 'rent' },
  { name: 'More', path: '/more', icon: MoreHorizontal, key: 'settings' },
];

export default function MainLayout() {
  const { user, logout, hasPermission } = useAuth();
  const { selectedHostel, hostels } = useBuilding();
  const navigate = useNavigate();
  const [liveNotice, setLiveNotice] = useState(null);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('dashboard_update', (data) => {
      setLiveNotice(`Live event: ${data.type || 'Data updated'}`);
      setTimeout(() => setLiveNotice(null), 4000);
    });
    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter desktop navigation according to user permissions & role
  const filteredDesktopNav = allDesktopNav.filter((item) => {
    if (item.key === 'access_control') {
      return user?.role === 'SUPER_ADMIN';
    }
    if (item.key === 'staff') {
      return user?.role === 'SUPER_ADMIN' || user?.role === 'HOSTEL_ADMIN';
    }
    if (item.key === 'settings') {
      return true;
    }
    return hasPermission(item.key);
  });

  // Filter mobile navigation
  const filteredMobileNav = allMobileNav.filter((item) => {
    if (item.key === 'settings') return true;
    return hasPermission(item.key);
  });

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
      />

      {/* Real-time WebSocket toast banner */}
      {liveNotice && (
        <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-xl text-xs font-semibold animate-in slide-in-from-top">
          {liveNotice}
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar-background border-r border-sidebar-border">
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">TAVYN</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user?.role || 'USER'}</p>
          </div>
          <button 
            onClick={handleLogout} 
            title="Sign out"
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Building Selector Pill in Sidebar */}
        <div className="p-3 border-b border-sidebar-border">
          <button
            onClick={() => setIsBuildingModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-primary/50 text-left transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold truncate text-foreground">
                  {selectedHostel?.name || 'Select Building'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {hostels.length} {hostels.length === 1 ? 'Building' : 'Buildings'} registered
                </p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredDesktopNav.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative pb-16 md:pb-0">
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-primary">TAVYN</h1>
            <button
              onClick={() => setIsBuildingModalOpen(true)}
              className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-medium text-foreground max-w-[140px] truncate"
            >
              <Building2 className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{selectedHostel?.name || 'Buildings'}</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground p-1">
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around z-50">
        {filteredMobileNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className={`h-5 w-5 ${item.name === 'Add' ? 'h-8 w-8 text-primary' : ''}`} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
