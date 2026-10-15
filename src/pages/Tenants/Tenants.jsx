import React, { useEffect, useState } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import Pagination from '../../components/Pagination';

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

  const fetchTenants = async () => {
    try {
      setLoading(true);
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

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Tenants</h2>
          <p className="text-muted-foreground">
            {selectedHostel?.name || 'All Properties'} • Manage active residents, tenure, and financial terms
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={fetchTenants} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => navigate('/tenants/add')} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" /> Add Tenant
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tenant name or phone number..." 
            className="pl-9 bg-card" 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onKeyDown={(e) => e.key === 'Enter' && fetchTenants()}
          />
        </div>
        <div className="flex bg-muted p-1 rounded-lg overflow-x-auto">
          {['All', 'Active', 'CheckedOut'].map((f) => (
            <Button 
              key={f}
              variant={filter === f ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className="whitespace-nowrap"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground">Loading tenants from server...</div>
      ) : tenants.length === 0 ? (
        <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground">
          No tenants found for {selectedHostel?.name || 'this property'}. Click "Add Tenant" to enroll your first resident.
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((t) => (
            <div 
              key={t.id} 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors gap-4"
            >
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {t.name}
                  {t.bed?.room?.roomNumber && (
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Room {t.bed.room.roomNumber} (Bed {t.bed.bedNumber})
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Phone: {t.phone} • Rent: ₹{(t.rentAmount || 0).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span>Deposit: ₹{(t.securityDeposit || 0).toLocaleString()}</span>
                  <span>Maintenance: ₹{(t.maintenanceFee || 0).toLocaleString()}/mo</span>
                  <span>Tenure: {t.tenureMonths || 11} mo</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="font-bold text-base">₹{(t.rentAmount || 0).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  <p className={`text-xs font-semibold ${
                    t.status === 'Active' ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {t.status}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/rent')} 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Collect
                </Button>
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
  );
}
