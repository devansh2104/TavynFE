import React, { useEffect, useState } from 'react';
import RoomCard from '../../components/RoomCard';
import RoomHistoryModal from '../../components/RoomHistoryModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { roomService, hostelService } from '../../services';
import { useBuilding } from '../../context/BuildingContext';
import { RefreshCw, Search, History } from 'lucide-react';

export default function Rooms() {
  const { selectedHostelId, selectedHostel } = useBuilding();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  // History modal state
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchRoomData = async () => {
    if (!selectedHostelId) return;
    try {
      setLoading(true);
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
              { id: 'B1', status: 'Available' },
              { id: 'B2', status: 'Available' }
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

  const handleOpenRoomHistory = (roomId) => {
    setSelectedRoomId(roomId);
    setIsHistoryModalOpen(true);
  };

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Rooms & Beds</h2>
          <p className="text-muted-foreground">
            {selectedHostel?.name || 'All Buildings'} • Manage occupancy, allocations & room history
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchRoomData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="flex bg-muted p-1 rounded-lg">
            <Button 
              variant={filter === 'All' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('All')}
            >
              All Beds
            </Button>
            <Button 
              variant={filter === 'Vacant' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilter('Vacant')}
            >
              Vacant Only
            </Button>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search room number..."
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">Loading rooms from server...</div>
      ) : floors.length === 0 ? (
        <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground">
          No floors or rooms set up yet for {selectedHostel?.name || 'this property'}.
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
                <h3 className="text-lg font-semibold border-b pb-2 flex items-center justify-between">
                  <span>{floor.name}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {visibleRooms.length} {visibleRooms.length === 1 ? 'Room' : 'Rooms'}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleRooms.map((room) => (
                    <div key={room.id} className="relative group">
                      <RoomCard
                        roomNumber={room.roomNumber}
                        capacity={room.capacity}
                        occupied={room.occupied}
                        beds={room.beds}
                        onOpenRoom={() => handleOpenRoomHistory(room.id)}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenRoomHistory(room.id)}
                        className="w-full mt-2 text-xs flex items-center justify-center gap-1.5 border"
                      >
                        <History className="h-3.5 w-3.5" /> View Room History
                      </Button>
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
