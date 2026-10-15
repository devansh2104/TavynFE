import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, ChevronLeft, Upload, AlertCircle } from 'lucide-react';
import { roomService, tenantService } from '../../services';

export default function AddTenant() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryRoomId = searchParams.get('roomId') || '';

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  
  // Financial & allocation fields
  const [rentAmount, setRentAmount] = useState('8500');
  const [securityDeposit, setSecurityDeposit] = useState('5000');
  const [maintenanceFee, setMaintenanceFee] = useState('500');
  const [tenureMonths, setTenureMonths] = useState('11');
  const [selectedRoomId, setSelectedRoomId] = useState(queryRoomId);
  const [selectedBedId, setSelectedBedId] = useState('');

  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRooms() {
      try {
        const roomsData = await roomService.getRooms();
        setRooms(roomsData || []);
        if (queryRoomId && roomsData?.some(r => r.id === queryRoomId)) {
          setSelectedRoomId(queryRoomId);
        } else if (roomsData?.length > 0 && !selectedRoomId) {
          setSelectedRoomId(roomsData[0].id);
        }
      } catch (err) {
        console.error('Failed to load rooms', err);
      }
    }
    loadRooms();
  }, [queryRoomId]);

  useEffect(() => {
    async function loadBeds() {
      if (selectedRoomId) {
        try {
          const bedsData = await roomService.getRoomBeds(selectedRoomId);
          setBeds(bedsData || []);
          const available = bedsData?.find((b) => b.status === 'Available');
          if (available) {
            setSelectedBedId(available.id);
          } else if (bedsData?.length > 0) {
            setSelectedBedId(bedsData[0].id);
          }
        } catch (err) {
          console.error('Failed to load beds', err);
        }
      }
    }
    loadBeds();
  }, [selectedRoomId]);

  const handleSaveTenant = async () => {
    setError('');
    setSubmitting(true);
    try {
      await tenantService.createTenant({
        name,
        phone,
        emergencyContact,
        rentAmount: parseFloat(rentAmount) || 0,
        securityDeposit: parseFloat(securityDeposit) || 0,
        maintenanceFee: parseFloat(maintenanceFee) || 0,
        tenureMonths: parseInt(tenureMonths, 10) || 11,
        bedId: selectedBedId || null,
        status: 'Active',
      });
      navigate('/tenants');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save tenant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in pb-20">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Add Tenant</h2>
          <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Room & Financial Terms'}
            {step === 3 && 'Documents & Confirmation'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input 
                  placeholder="e.g. Rahul Sharma" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input 
                  placeholder="e.g. 9876543210" 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Emergency / Parent Contact</label>
                <Input 
                  placeholder="Parent / Guardian number" 
                  type="tel" 
                  value={emergencyContact} 
                  onChange={(e) => setEmergencyContact(e.target.value)} 
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Room</label>
                  <select 
                    value={selectedRoomId} 
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Bed</label>
                  <select 
                    value={selectedBedId} 
                    onChange={(e) => setSelectedBedId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {beds.length === 0 ? (
                      <option value="">No beds created</option>
                    ) : (
                      beds.map((b) => (
                        <option key={b.id} value={b.id}>
                          Bed {b.bedNumber} ({b.status})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Rent (₹) *</label>
                  <Input 
                    placeholder="8500" 
                    type="number" 
                    value={rentAmount} 
                    onChange={(e) => setRentAmount(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Security Deposit (₹) *</label>
                  <Input 
                    placeholder="5000" 
                    type="number" 
                    value={securityDeposit} 
                    onChange={(e) => setSecurityDeposit(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Maintenance Fee (₹/mo)</label>
                  <Input 
                    placeholder="500" 
                    type="number" 
                    value={maintenanceFee} 
                    onChange={(e) => setMaintenanceFee(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tenure (Months)</label>
                  <Input 
                    placeholder="11" 
                    type="number" 
                    min="1"
                    max="60"
                    value={tenureMonths} 
                    onChange={(e) => setTenureMonths(e.target.value)} 
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="p-4 bg-muted/40 rounded-lg space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-muted-foreground">Name:</span> <span className="font-semibold">{name}</span></p>
                  <p><span className="text-muted-foreground">Phone:</span> <span className="font-semibold">{phone}</span></p>
                  <p><span className="text-muted-foreground">Monthly Rent:</span> <span className="font-semibold text-primary">₹{parseFloat(rentAmount || 0).toLocaleString()}</span></p>
                  <p><span className="text-muted-foreground">Security Deposit:</span> <span className="font-semibold">₹{parseFloat(securityDeposit || 0).toLocaleString()}</span></p>
                  <p><span className="text-muted-foreground">Maintenance:</span> <span className="font-semibold">₹{parseFloat(maintenanceFee || 0).toLocaleString()}</span></p>
                  <p><span className="text-muted-foreground">Tenure:</span> <span className="font-semibold">{tenureMonths || 11} Months</span></p>
                </div>
              </div>

              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-2 hover:bg-muted/50 transition-colors cursor-pointer mt-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Upload ID Proof (Aadhar / PAN)</p>
                <p className="text-xs text-muted-foreground">Optional at enrollment</p>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            variant="outline" 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/tenants')}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 3 ? (
            <Button 
              onClick={() => setStep(step + 1)} 
              disabled={step === 1 && (!name || !phone)}
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleSaveTenant} 
              disabled={submitting} 
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> 
              {submitting ? 'Saving...' : 'Save Tenant'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
