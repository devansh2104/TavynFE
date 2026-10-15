import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCheck, Plus, RefreshCw, X, Shield, Phone, Mail, Building2, Check, AlertCircle } from 'lucide-react';
import { staffService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import { useAuth } from '../../context/AuthContext';

const MENU_MODULES = [
  { key: 'dashboard', label: 'Dashboard & Control Center', desc: 'Overview metrics & real-time alerts' },
  { key: 'tenants', label: 'Tenants Management', desc: 'Resident directory, enrollment & checkout' },
  { key: 'rooms', label: 'Rooms & Bed Allocations', desc: 'Spatial room grid & vacancy audit' },
  { key: 'rent', label: 'Rent Invoicing & Collection', desc: 'Monthly dues, payments & tax invoices' },
  { key: 'electricity', label: 'Electricity Meter Readings', desc: 'Per-unit entry & bill generation' },
  { key: 'expenses', label: 'Expense Tracking', desc: 'Record bills, maintenance & receipts' },
  { key: 'reports', label: 'Financial Reports', desc: 'Monthly P&L, collections vs expenses' }
];

export default function StaffManagement() {
  const { selectedHostelId, selectedHostel, hostels } = useBuilding();
  const { user } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal: Add Staff
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('staff123');
  const [assignedHostelId, setAssignedHostelId] = useState(selectedHostelId || '');
  const [newStaffPermissions, setNewStaffPermissions] = useState({
    dashboard: true,
    tenants: true,
    rooms: true,
    rent: true,
    electricity: true,
    expenses: false,
    reports: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modal: Edit Access Permissions
  const [editingStaff, setEditingStaff] = useState(null);
  const [editPermissions, setEditPermissions] = useState({});
  const [updatingPerms, setUpdatingPerms] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffService.getStaff({
        hostelId: user?.role === 'SUPER_ADMIN' ? undefined : selectedHostelId
      });
      setStaffList(data || []);
    } catch (err) {
      console.error('Failed to load staff list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [selectedHostelId]);

  useEffect(() => {
    if (selectedHostelId) {
      setAssignedHostelId(selectedHostelId);
    }
  }, [selectedHostelId]);

  const handleToggleNewPerm = (key) => {
    setNewStaffPermissions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleEditPerm = (key) => {
    setEditPermissions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await staffService.createStaff({
        name,
        email,
        phone,
        password,
        hostelId: assignedHostelId || selectedHostelId,
        permissions: newStaffPermissions
      });
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!editingStaff) return;
    setUpdatingPerms(true);
    try {
      await staffService.updatePermissions(editingStaff.id, editPermissions);
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update permissions');
    } finally {
      setUpdatingPerms(false);
    }
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to remove staff member "${staffName}"?`)) return;
    try {
      await staffService.deleteStaff(staffId);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete staff');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" /> Staff & Access Management
          </h2>
          <p className="text-muted-foreground mt-0.5">
            {selectedHostel?.name || 'All Properties'} • Configure team member roles and granular menu toggles
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="icon" onClick={fetchStaff} disabled={loading} className="h-9 w-9">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 flex-1 sm:flex-none">
            <Plus className="h-4 w-4" /> Add Staff Member
          </Button>
        </div>
      </div>

      {/* STAFF LIST */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">Loading staff members...</div>
      ) : staffList.length === 0 ? (
        <div className="p-12 text-center border rounded-xl bg-card text-muted-foreground space-y-3">
          <UserCheck className="h-10 w-10 mx-auto text-muted-foreground opacity-40" />
          <p className="text-sm font-semibold text-foreground">No staff members found</p>
          <p className="text-xs">Add your first caretaker or manager and assign them custom menu access.</p>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            Add Staff Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffList.map((staff) => {
            const perms = staff.effectivePermissions || {};
            const enabledModulesCount = Object.values(perms).filter(Boolean).length;

            return (
              <Card key={staff.id} className="border hover:border-primary/40 transition-colors shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {staff.name}
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          STAFF
                        </span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{staff.staffProfile?.hostel?.name || 'Assigned Property'}</span>
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingStaff(staff);
                          setEditPermissions(perms);
                        }}
                        className="text-xs h-8 gap-1"
                      >
                        <Shield className="h-3.5 w-3.5 text-primary" /> Edit Access
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                        className="text-xs h-8 text-destructive hover:bg-destructive hover:text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {staff.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {staff.phone || 'No phone'}
                    </span>
                  </div>

                  {/* ACTIVE MENU BADGES */}
                  <div className="border-t pt-2.5">
                    <p className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center justify-between">
                      <span>Enabled Menus</span>
                      <span className="text-muted-foreground font-normal">{enabledModulesCount} of {MENU_MODULES.length} Allowed</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {MENU_MODULES.map((m) => {
                        const isAllowed = perms[m.key] !== false;
                        return (
                          <span
                            key={m.key}
                            className={`text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                              isAllowed
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-muted text-muted-foreground line-through opacity-60'
                            }`}
                          >
                            {isAllowed && <Check className="h-2.5 w-2.5" />}
                            {m.label.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD STAFF ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <Card className="w-full max-w-lg shadow-2xl border bg-card my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Add New Staff Member</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <form onSubmit={handleCreateStaff}>
              <CardContent className="pt-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Suresh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Phone Number *</label>
                    <Input
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Email (Login ID) *</label>
                    <Input
                      required
                      type="email"
                      placeholder="staff@tavyn.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Temporary Password *</label>
                    <Input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Assign to Property</label>
                  <select
                    value={assignedHostelId}
                    onChange={(e) => setAssignedHostelId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                {/* ON / OFF MENU TOGGLES */}
                <div className="border-t pt-3 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Menu Access Permissions (On / Off)
                  </label>
                  <div className="space-y-2">
                    {MENU_MODULES.map((m) => {
                      const enabled = !!newStaffPermissions[m.key];
                      return (
                        <div
                          key={m.key}
                          onClick={() => handleToggleNewPerm(m.key)}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                            enabled ? 'bg-primary/5 border-primary/40' : 'bg-muted/40 border-border opacity-70'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-foreground">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                          </div>
                          <div
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                              enabled ? 'bg-primary justify-end' : 'bg-muted-foreground/30 justify-start'
                            }`}
                          >
                            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Staff Member'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* ================= MODAL: EDIT ACCESS PERMISSIONS ================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <Card className="w-full max-w-lg shadow-2xl border bg-card my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Manage Access: {editingStaff.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle menu items On or Off in real-time</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingStaff(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {MENU_MODULES.map((m) => {
                const enabled = editPermissions[m.key] !== false;
                return (
                  <div
                    key={m.key}
                    onClick={() => handleToggleEditPerm(m.key)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      enabled ? 'bg-primary/5 border-primary/40' : 'bg-muted/40 border-border opacity-70'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{m.label}</p>
                      <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                    </div>

                    <div
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        enabled ? 'bg-primary justify-end' : 'bg-muted-foreground/30 justify-start'
                      }`}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <CardFooter className="border-t pt-3 flex justify-between">
              <Button variant="outline" onClick={() => setEditingStaff(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePermissions} disabled={updatingPerms}>
                {updatingPerms ? 'Saving...' : 'Save Permissions'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
