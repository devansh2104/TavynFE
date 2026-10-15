import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCheck, RefreshCw, X, Shield, Building2, Check, AlertCircle } from 'lucide-react';
import { accessControlService } from '../../services';

const MENU_MODULES = [
  { key: 'dashboard', label: 'Dashboard & Control Center', desc: 'Overview metrics & real-time alerts' },
  { key: 'tenants', label: 'Tenants Management', desc: 'Resident directory, enrollment & checkout' },
  { key: 'rooms', label: 'Rooms & Bed Allocations', desc: 'Spatial room grid & vacancy audit' },
  { key: 'rent', label: 'Rent Invoicing & Collection', desc: 'Monthly dues, payments & tax invoices' },
  { key: 'electricity', label: 'Electricity Meter Readings', desc: 'Per-unit entry & bill generation' },
  { key: 'expenses', label: 'Expense Tracking', desc: 'Record bills, maintenance & receipts' },
  { key: 'reports', label: 'Financial Reports', desc: 'Monthly P&L, collections vs expenses' }
];

export default function AccessControl() {
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' | 'roles'
  const [hostelAdmins, setHostelAdmins] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Edit Admin permissions modal
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editPermissions, setEditPermissions] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminsData, rolesData] = await Promise.all([
        accessControlService.getHostelAdmins().catch(() => []),
        accessControlService.getRolePermissions().catch(() => ({}))
      ]);
      setHostelAdmins(adminsData || []);
      setRolePermissions(rolesData || {});
    } catch (err) {
      console.error('Failed to load access control data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAdminPerm = (key) => {
    setEditPermissions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveAdminPermissions = async () => {
    if (!editingAdmin) return;
    setSaving(true);
    try {
      await accessControlService.updateUserPermissions(editingAdmin.id, editPermissions);
      setEditingAdmin(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRolePerm = async (role, key) => {
    const current = rolePermissions[role] || {};
    const updated = {
      ...current,
      [key]: !current[key]
    };
    try {
      await accessControlService.updateRolePermissions(role, updated);
      setRolePermissions((prev) => ({
        ...prev,
        [role]: updated
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role default');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Super Admin Access Control
          </h2>
          <p className="text-muted-foreground mt-0.5">
            Manage menu access permissions for Hostel Admins and configure role-level defaults
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'admins' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('admins')}
            >
              Hostel Admins ({hostelAdmins.length})
            </Button>
            <Button
              variant={activeTab === 'roles' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('roles')}
            >
              Role Defaults
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading} className="h-9 w-9">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">Loading access configurations...</div>
      ) : activeTab === 'admins' ? (
        /* ================= HOSTEL ADMINS LIST ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostelAdmins.map((admin) => {
            const perms = admin.effectivePermissions || {};
            const enabledCount = Object.values(perms).filter(Boolean).length;

            return (
              <Card key={admin.id} className="border hover:border-primary/40 transition-colors shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {admin.name}
                        <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                          HOSTEL ADMIN
                        </span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{admin.email} • {admin.phone || 'No phone'}</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAdmin(admin);
                        setEditPermissions(perms);
                      }}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Shield className="h-3.5 w-3.5 text-primary" /> Manage Toggles
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  {admin.hostels && admin.hostels.length > 0 && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Properties: {admin.hostels.map(h => h.name).join(', ')}</span>
                    </div>
                  )}

                  <div className="border-t pt-2.5">
                    <p className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center justify-between">
                      <span>Menu Permissions</span>
                      <span className="text-muted-foreground font-normal">{enabledCount} of {MENU_MODULES.length} Enabled</span>
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
                                : 'bg-destructive/10 text-destructive line-through opacity-60'
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
      ) : (
        /* ================= ROLE-LEVEL DEFAULTS ================= */
        <div className="space-y-6">
          {['HOSTEL_ADMIN', 'STAFF'].map((role) => {
            const rolePerms = rolePermissions[role] || {};

            return (
              <Card key={role} className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Default Permissions: <span className="text-primary">{role}</span></span>
                    <span className="text-xs text-muted-foreground font-normal">Applies automatically unless overridden per user</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {MENU_MODULES.map((m) => {
                      const enabled = rolePerms[m.key] !== false;
                      return (
                        <div
                          key={m.key}
                          onClick={() => handleToggleRolePerm(role, m.key)}
                          className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                            enabled ? 'bg-primary/5 border-primary/40' : 'bg-muted/40 border-border opacity-70'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-foreground">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                          </div>
                          <div
                            className={`w-11 h-6 flex items-center rounded-full p-1 shrink-0 ml-2 transition-colors ${
                              enabled ? 'bg-primary justify-end' : 'bg-muted-foreground/30 justify-start'
                            }`}
                          >
                            <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: EDIT HOSTEL ADMIN PERMISSIONS ================= */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <Card className="w-full max-w-lg shadow-2xl border bg-card my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Configure Access: {editingAdmin.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle menu items On or Off for this Hostel Admin</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingAdmin(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {MENU_MODULES.map((m) => {
                const enabled = editPermissions[m.key] !== false;
                return (
                  <div
                    key={m.key}
                    onClick={() => handleToggleAdminPerm(m.key)}
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
              <Button variant="outline" onClick={() => setEditingAdmin(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAdminPermissions} disabled={saving}>
                {saving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
