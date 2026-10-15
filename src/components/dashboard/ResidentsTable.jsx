import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Search, UserCheck, CreditCard, ChevronRight, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const defaultResidents = [
  {
    id: 'R001',
    name: 'Aarav Sharma',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@example.com',
    room: 'Room 102 - Bed 1',
    monthlyRent: 8500,
    status: 'Paid',
    joinDate: '12 Jan 2026',
  },
  {
    id: 'R002',
    name: 'Priya Patel',
    phone: '+91 91234 56789',
    email: 'priya.patel@example.com',
    room: 'Room 205 - Bed 2',
    monthlyRent: 9000,
    status: 'Due',
    joinDate: '01 Feb 2026',
  },
  {
    id: 'R003',
    name: 'Rohan Gupta',
    phone: '+91 99887 76655',
    email: 'rohan.gupta@example.com',
    room: 'Room 310 - Bed 1',
    monthlyRent: 7500,
    status: 'Paid',
    joinDate: '18 Feb 2026',
  },
  {
    id: 'R004',
    name: 'Ananya Singh',
    phone: '+91 98112 23344',
    email: 'ananya.s@example.com',
    room: 'Room 101 - Bed 3',
    monthlyRent: 8000,
    status: 'Overdue',
    joinDate: '24 Nov 2025',
  },
  {
    id: 'R005',
    name: 'Kabir Verma',
    phone: '+91 97654 32190',
    email: 'kabir.v@example.com',
    room: 'Room 412 - Bed 1',
    monthlyRent: 9500,
    status: 'Paid',
    joinDate: '05 Mar 2026',
  },
];

export function ResidentsTable({ residents = defaultResidents }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = residents.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm)
  );

  return (
    <Card className="rounded-xl border border-border/80 bg-card shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-3">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
            Recent Residents & Dues
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Active resident profiles and current fee statuses
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search resident..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs rounded-lg bg-muted/40"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/tenants')}
            className="h-8 text-xs shrink-0 rounded-lg gap-1"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold py-3 pl-6">Resident</TableHead>
                <TableHead className="text-xs font-semibold py-3">Room / Bed</TableHead>
                <TableHead className="text-xs font-semibold py-3">Monthly Rent</TableHead>
                <TableHead className="text-xs font-semibold py-3">Fee Status</TableHead>
                <TableHead className="text-xs font-semibold py-3 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((resident) => (
                <TableRow key={resident.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3 pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg border border-border/60">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${resident.name}`} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {resident.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-foreground">
                          {resident.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {resident.phone}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium text-foreground">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono">
                      {resident.room}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold">
                    ₹{resident.monthlyRent.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3">
                    {resident.status === 'Paid' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Paid
                      </span>
                    )}
                    {resident.status === 'Due' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    )}
                    {resident.status === 'Overdue' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        Overdue
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl shadow-lg w-44">
                        <DropdownMenuItem onClick={() => navigate('/tenants')} className="text-xs cursor-pointer">
                          <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/rent')} className="text-xs cursor-pointer">
                          <CreditCard className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          <span>Record Payment</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE CARD LIST VIEW */}
        <div className="block md:hidden divide-y divide-border/60">
          {filtered.map((resident) => (
            <div key={resident.id} className="p-3.5 space-y-2.5 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9 rounded-lg border border-border/60 shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${resident.name}`} />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                      {resident.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{resident.name}</span>
                    <span className="text-[11px] text-muted-foreground">{resident.phone}</span>
                  </div>
                </div>

                {resident.status === 'Paid' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Paid
                  </span>
                )}
                {resident.status === 'Due' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Pending
                  </span>
                )}
                {resident.status === 'Overdue' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                    Overdue
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono">
                  {resident.room}
                </div>
                <div className="text-xs font-bold text-foreground">
                  ₹{resident.monthlyRent.toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">/mo</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/rent')}
                  className="flex-1 h-7 text-[11px] rounded-lg gap-1"
                >
                  <CreditCard className="h-3 w-3" />
                  <span>Collect Rent</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/tenants')}
                  className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span>Profile</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
