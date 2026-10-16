import React, { useEffect, useState } from 'react';
import { Search, Plus, RefreshCw, Users, CreditCard, Shield, Phone, Mail, MoreHorizontal, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import { useAutoSync } from '../../hooks/useAutoSync';
import Pagination from '../../components/Pagination';
import AskAiSearchBox from '../../components/AskAiSearchBox';

export default function Tenants() {
  const navigate = useNavigate();
  const { selectedHostelId, selectedHostel } = useBuilding();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchTenants = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await tenantService.getTenants({
        hostelId: selectedHostelId,
        status: filter !== 'All' ? filter : undefined,
        search,
        page,
        limit: 10
      });

      const list = res.tenants || (Array.isArray(res) ? res : []);
      setTenants(list);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || list.length);
    } catch (err) {
      console.error('Error fetching tenants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [selectedHostelId, filter, page]);

  useAutoSync(() => fetchTenants(true));

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Residents Directory
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs rounded-full px-2.5 py-0.5">
              {totalRecords} Enrolled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {selectedHostel?.name || 'All Properties'} • Manage active residents, tenure, room assignments, and financial terms
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            size="sm" 
            onClick={() => navigate('/tenants/add')} 
            className="h-9 rounded-lg text-xs gap-2 font-semibold shadow-sm flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            <span>Add Resident</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <AskAiSearchBox
            placeholder="Ask AI or search resident by name, phone..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onSubmit={() => fetchTenants()}
            context="tenants"
            className="w-full"
          />
        </div>
        
        {/* Status Filter Pills */}
        <div className="flex bg-muted/60 p-1 rounded-xl gap-1">
          {['All', 'Active', 'CheckedOut'].map((f) => (
            <Button 
              key={f}
              variant={filter === f ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className="h-8 text-xs px-3 rounded-lg font-medium whitespace-nowrap"
            >
              {f === 'CheckedOut' ? 'Checked Out' : f}
            </Button>
          ))}
        </div>
      </div>

      {/* Modern Shadcn Table Card */}
      <Card className="rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Loading resident profiles from database...</span>
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
              <div className="p-4 rounded-2xl bg-muted/50 text-muted-foreground">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-sm">No residents found</p>
                <p className="text-xs max-w-sm text-muted-foreground">
                  No records match your search or filter. You can enroll your first resident now.
                </p>
              </div>
              <Button size="sm" onClick={() => navigate('/tenants/add')} className="rounded-lg text-xs mt-2">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Enroll New Resident
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
                      <TableHead className="text-xs font-semibold py-3">Allocated Bed</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Monthly Rent</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Deposit / Tenure</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Status</TableHead>
                      <TableHead className="text-xs font-semibold py-3 pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((t) => (
                      <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-xl border border-border/60">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`} />
                              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                                {t.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-sm font-semibold text-foreground">{t.name}</span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {t.phone}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          {t.bed?.room?.roomNumber ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border/60 text-xs font-medium font-mono text-foreground">
                              <Bed className="h-3.5 w-3.5 text-primary" />
                              <span>Room {t.bed.room.roomNumber} • Bed {t.bed.bedNumber}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Unassigned</span>
                          )}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            ₹{(t.rentAmount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-muted-foreground"> /mo</span>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>Deposit: <strong className="text-foreground">₹{(t.securityDeposit || 0).toLocaleString()}</strong></p>
                            <p className="text-[11px]">{t.tenureMonths || 11} months tenure</p>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          {t.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                              {t.status}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="py-3.5 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate('/rent')} 
                              className="h-8 text-xs rounded-lg gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Collect</span>
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-44">
                                <DropdownMenuItem onClick={() => navigate('/rent')} className="text-xs cursor-pointer">
                                  View Invoices
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/electricity')} className="text-xs cursor-pointer">
                                  Meter Usage
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE CARD LIST VIEW */}
              <div className="block md:hidden divide-y divide-border/60">
                {tenants.map((t) => (
                  <div key={t.id} className="p-3.5 space-y-2.5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 rounded-xl border border-border/60 shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`} />
                          <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                            {t.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{t.name}</span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {t.phone}
                          </span>
                        </div>
                      </div>

                      {t.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                          {t.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                      <div>
                        {t.bed?.room?.roomNumber ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-foreground">
                            <Bed className="h-3 w-3 text-primary" />
                            Room {t.bed.room.roomNumber} • Bed {t.bed.bedNumber}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-foreground">
                        ₹{(t.rentAmount || 0).toLocaleString()} <span className="text-[10px] text-muted-foreground font-normal">/mo</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Deposit: ₹{(t.securityDeposit || 0).toLocaleString()}</span>
                      <span>{t.tenureMonths || 11} mo tenure</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/rent')} 
                        className="flex-1 h-7 text-xs rounded-lg gap-1.5 font-medium"
                      >
                        <CreditCard className="h-3 w-3" />
                        <span>Collect Rent</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${t.phone}`)}
                        className="h-7 px-3 text-xs rounded-lg gap-1 text-muted-foreground"
                      >
                        <Phone className="h-3 w-3" />
                        <span>Call</span>
                      </Button>
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
