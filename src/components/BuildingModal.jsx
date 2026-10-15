import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Plus, X, MapPin } from 'lucide-react';
import { hostelService } from '../services';
import { useBuilding } from '../context/BuildingContext';

export default function BuildingModal({ isOpen, onClose }) {
  const { hostels, selectedHostelId, selectHostel, refreshHostels } = useBuilding();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [floorsCount, setFloorsCount] = useState('3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreateHostel = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const newHostel = await hostelService.createHostel({ name, address });
      const floorsNum = parseInt(floorsCount, 10) || 1;
      // Automatically seed initial floors
      for (let i = 1; i <= floorsNum; i++) {
        await hostelService.createFloor(newHostel.id, { name: `Floor ${i}` });
      }
      await refreshHostels();
      selectHostel(newHostel.id);
      setName('');
      setAddress('');
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create building');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <Card className="w-full max-w-lg shadow-2xl border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Manage Properties / Buildings</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {!showAddForm ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Select Active Property</span>
                <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1">
                  <Plus className="h-4 w-4" /> Add Building
                </Button>
              </div>

              <div className="space-y-2">
                {hostels.map((hostel) => {
                  const isSelected = hostel.id === selectedHostelId;
                  return (
                    <div
                      key={hostel.id}
                      onClick={() => {
                        selectHostel(hostel.id);
                        onClose();
                      }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          {hostel.name}
                          {isSelected && (
                            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                              ACTIVE
                            </span>
                          )}
                        </h4>
                        {hostel.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" /> {hostel.address}
                          </p>
                        )}
                      </div>
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="pointer-events-none"
                      >
                        {isSelected ? 'Selected' : 'Switch'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateHostel} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Building / Hostel Name *</label>
                <Input
                  required
                  placeholder="e.g. TAVYN Residency II"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address / Location</label>
                <Input
                  placeholder="e.g. Sector 62, Noida"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Number of Floors</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={floorsCount}
                  onChange={(e) => setFloorsCount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Floors will be automatically created (Floor 1, Floor 2...)</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Back to List
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Building'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="border-t pt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
