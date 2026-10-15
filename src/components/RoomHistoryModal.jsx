import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Users, Zap, Wrench, Calendar, Bed, Phone, UserPlus } from 'lucide-react';
import { roomService } from '../services';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function RoomHistoryModal({ roomId, isOpen, onClose }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenants'); // 'tenants' | 'electricity' | 'expenses'

  useEffect(() => {
    if (isOpen && roomId) {
      setLoading(true);
      roomService
        .getRoomHistory(roomId)
        .then((res) => setData(res))
        .catch((err) => console.error('Failed to load room history', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const handleAddTenantToRoom = () => {
    onClose();
    navigate(`/tenants/add?roomId=${roomId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <Card className="w-full max-w-2xl shadow-2xl border-border bg-card max-h-[85vh] flex flex-col">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b shrink-0">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              Room {data?.room?.roomNumber || 'Details'} History
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Floor: {data?.room?.floor?.name || 'N/A'} • Capacity: {data?.room?.capacity || 2} Beds
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAddTenantToRoom}
              className="gap-1.5 h-8 text-xs bg-primary"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add Tenant
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Tab switch */}
        <div className="flex border-b px-4 bg-muted/30 shrink-0">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'tenants'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Tenant Occupants ({data?.tenants?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('electricity')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'electricity'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> Meter Readings ({data?.electricityReadings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'expenses'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" /> Room Expenses ({data?.expenses?.length || 0})
          </button>
        </div>

        {/* Body Content */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading room historical logs...</div>
          ) : (
            <>
              {/* TENANTS HISTORY */}
              {activeTab === 'tenants' && (
                <div className="space-y-3">
                  {!data?.tenants || data.tenants.length === 0 ? (
                    <div className="text-center py-10 space-y-3 border border-dashed rounded-xl p-6 bg-muted/10">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">No tenant stay records for this room yet</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Allocate an available bed in Room {data?.room?.roomNumber} to a new resident.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleAddTenantToRoom}
                        className="gap-1.5 text-xs mx-auto"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Allocate Tenant to Room {data?.room?.roomNumber}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center pb-1">
                        <span className="text-xs font-medium text-muted-foreground">Stay Records</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAddTenantToRoom}
                          className="h-7 text-xs text-primary gap-1"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Add Another Tenant
                        </Button>
                      </div>

                      {data.tenants.map((t) => (
                        <div key={t.id} className="p-3 rounded-lg border bg-card flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-sm flex items-center gap-2">
                              {t.name}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                t.status === 'Active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                              }`}>
                                {t.status}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {t.phone}</span>
                              <span>•</span>
                              <span>Rent: ₹{t.rentAmount?.toLocaleString()}</span>
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>In: {t.checkInDate ? format(new Date(t.checkInDate), 'dd MMM yyyy') : 'N/A'}</p>
                            {t.checkOutDate && (
                              <p className="text-destructive font-medium">Out: {format(new Date(t.checkOutDate), 'dd MMM yyyy')}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* ELECTRICITY HISTORY */}
              {activeTab === 'electricity' && (
                <div className="space-y-2">
                  {!data?.electricityReadings || data.electricityReadings.length === 0 ? (
                    <p className="text-sm text-center py-8 text-muted-foreground">No electricity meter entries for this room.</p>
                  ) : (
                    data.electricityReadings.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg border bg-card flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm">Month {r.month}/{r.year}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Units: <span className="font-medium text-foreground">{r.unitsConsumed}</span> (From {r.previousReading} to {r.currentReading}) @ ₹{r.ratePerUnit || 8}/u
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">₹{(r.netAmount || r.billAmount || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(r.createdAt), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* EXPENSES / REPAIRS HISTORY */}
              {activeTab === 'expenses' && (
                <div className="space-y-2">
                  {!data?.expenses || data.expenses.length === 0 ? (
                    <p className="text-sm text-center py-8 text-muted-foreground">No room-specific maintenance or expenses logged.</p>
                  ) : (
                    data.expenses.map((e) => (
                      <div key={e.id} className="p-3 rounded-lg border bg-card flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm">{e.category}</p>
                          <p className="text-xs text-muted-foreground">{e.description || 'No notes added'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-destructive">₹{e.amount?.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(e.date), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
