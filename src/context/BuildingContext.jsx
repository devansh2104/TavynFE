import React, { createContext, useContext, useState, useEffect } from 'react';
import { hostelService } from '../services';

const BuildingContext = createContext(null);

export function BuildingProvider({ children }) {
  const [hostels, setHostels] = useState([]);
  const [selectedHostelId, setSelectedHostelId] = useState(() => {
    return localStorage.getItem('tavyn_selected_hostel') || '';
  });
  const [loading, setLoading] = useState(true);

  const refreshHostels = async () => {
    try {
      setLoading(true);
      const data = await hostelService.getHostels();
      setHostels(data || []);

      if (data && data.length > 0) {
        // If nothing is selected or previous selection no longer exists, default to first hostel
        const exists = data.some((h) => h.id === selectedHostelId);
        if (!selectedHostelId || !exists) {
          setSelectedHostelId(data[0].id);
          localStorage.setItem('tavyn_selected_hostel', data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load buildings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHostels();
  }, []);

  const selectHostel = (id) => {
    setSelectedHostelId(id);
    if (id) {
      localStorage.setItem('tavyn_selected_hostel', id);
    } else {
      localStorage.removeItem('tavyn_selected_hostel');
    }
  };

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId) || hostels[0] || null;

  return (
    <BuildingContext.Provider
      value={{
        hostels,
        selectedHostelId,
        selectedHostel,
        selectHostel,
        refreshHostels,
        loading
      }}
    >
      {children}
    </BuildingContext.Provider>
  );
}

export function useBuilding() {
  const context = useContext(BuildingContext);
  if (!context) throw new Error('useBuilding must be used within BuildingProvider');
  return context;
}
