import React, { useEffect, useState } from 'react';
import RoomCard from '../../components/RoomCard';
import RoomHistoryModal from '../../components/RoomHistoryModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { roomService, hostelService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import { RefreshCw, Search, History, Building2, Bed, Layers, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAutoSync } from '../../hooks/useAutoSync';
import AskAiSearchBox from '../../components/AskAiSearchBox';

export default function Rooms() {
  const navigate = useNavigate();
  const { selectedHostelId, selectedHostel } = useBuilding();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  // History modal state
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchRoomData = async (silent = false) => {
    if (!selectedHostelId) return;
    try {
      if (!silent) setLoading(true);
      const [floorsData, roomsData] = await Promise.all([
        hostelService.getFloors(selectedHostelId).catch(() => []),
        roomService.getRooms({ hostelId: selectedHostelId }).catch(() => [])
      ]);

      // Group rooms by floors
      const mappedFloors = floorsData.map((f) => {
        const floorRooms = roomsData.filter((r) => r.floorId === f.id);
        return {
          id: f.id,
          name: f.name,
          rooms: floorRooms.map((r) => {
            const bedList = r.beds || [
              { id: 'B1', bedNumber: 1, status: 'Available' },
              { id: 'B2', bedNumber: 2, status: 'Available' }
            ];
            const occupiedCount = bedList.filter((b) => b.status === 'Occupied' || b.tenant).length;
            return {
              id: r.id,
              roomNumber: r.roomNumber,
              capacity: r.capacity || 2,
              occupied: occupiedCount,
              beds: bedList
            };
          })
        };
      });
      setFloors(mappedFloors);
    } catch (err) {
      console.error('Error fetching rooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [selectedHostelId]);

  useAutoSync(() => fetchRoomData(true));

  const handleOpenRoomHistory = (roomId) => {
    setSelectedRoomId(roomId);
    setIsHistoryModalOpen(true);
  };

  // Stats calculation
  const totalRooms = floors.reduce((acc, f) => acc + f.rooms.length, 0);
  const totalBeds = floors.reduce((acc, f) => acc + f.rooms.reduce((ra, r) => ra + r.capacity, 0), 0);
  const totalOccupied = floors.reduce((acc, f) => acc + f.rooms.reduce((ra, r) => ra + r.occupied, 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <RoomHistoryModal
        roomId={selectedRoomId}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedRoomId(null);
        }}
      />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Rooms & Bed Allocations
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs rounded-full px-2.5 py-0.5">
              {totalRooms} Rooms • {totalBeds} Beds
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {selectedHostel?.name || 'All Buildings'} • Floor layouts, room occupancies, and resident bed mapping
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            size="sm" 
            onClick={() => navigate('/tenants/add')} 
            className="h-9 rounded-lg text-xs gap-2 font-semibold shadow-sm flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4" />
            <span>Assign Resident</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <AskAiSearchBox
            placeholder="Ask AI or search room # (e.g. 101, 202)..."
            value={search}
            onChange={(val) => setSearch(val)}
            context="rooms"
            className="w-full"
          />
        </div>

        <div className="flex bg-muted/60 p-1 rounded-xl gap-1 w-full sm:w-auto">
          <Button 
            variant={filter === 'All' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setFilter('All')}
            className="flex-1 sm:flex-none h-8 text-xs px-3 rounded-lg font-medium"
          >
            All Beds ({totalBeds})
          </Button>
          <Button 
            variant={filter === 'Vacant' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => setFilter('Vacant')}
            className="flex-1 sm:flex-none h-8 text-xs px-3 rounded-lg font-medium text-emerald-600"
          >
            Vacant Only ({totalBeds - totalOccupied})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span>Loading room allocations and floor plans...</span>
        </div>
      ) : floors.length === 0 ? (
        <div className="p-16 text-center border rounded-2xl bg-card text-muted-foreground flex flex-col items-center gap-3">
          <div className="p-4 rounded-2xl bg-muted/50 text-muted-foreground">
            <Layers className="h-8 w-8" />
          </div>
          <p className="font-semibold text-foreground text-sm">No floors or rooms set up yet</p>
          <p className="text-xs max-w-sm">No rooms found for {selectedHostel?.name || 'this property'}.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {floors.map((floor) => {
            const visibleRooms = floor.rooms.filter((r) => {
              const matchesFilter = filter === 'Vacant' ? r.occupied < r.capacity : true;
              const matchesSearch = search ? r.roomNumber.toLowerCase().includes(search.toLowerCase()) : true;
              return matchesFilter && matchesSearch;
            });

            if (visibleRooms.length === 0) return null;

            return (
              <div key={floor.id} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-bold text-foreground tracking-tight">
                      {floor.name}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                    {visibleRooms.length} {visibleRooms.length === 1 ? 'Room' : 'Rooms'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleRooms.map((room) => (
                    <div key={room.id} className="relative group flex flex-col">
                      <RoomCard
                        roomNumber={room.roomNumber}
                        capacity={room.capacity}
                        occupied={room.occupied}
                        beds={room.beds}
                        onOpenRoom={() => handleOpenRoomHistory(room.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
