import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Trip, Player, CreateTripForm, PlayerStatus } from '@/types';
import { mockTrips, mockDM } from '@/data/mock';
import { generateId, generateShareCode } from '@/utils';

interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;
  createTrip: (form: CreateTripForm) => Trip;
  updatePlayerStatus: (tripId: string, playerId: string, status: PlayerStatus) => void;
  getTripById: (id: string) => Trip | undefined;
  addPlayer: (tripId: string, player: Omit<Player, 'id' | 'status' | 'applyTime'>) => void;
  sendNotification: (tripId: string, type: 'reminder' | 'notes' | 'policy') => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  const createTrip = useCallback((form: CreateTripForm): Trip => {
    const newTrip: Trip = {
      id: generateId(),
      scriptName: form.scriptName,
      city: form.city,
      district: form.district,
      location: form.location,
      totalSeats: form.totalSeats,
      availableSeats: form.totalSeats,
      duration: form.duration,
      tags: form.tags,
      newbieFriendly: form.newbieFriendly,
      timeSlots: form.timeSlots,
      price: form.price,
      feeNote: form.feeNote,
      suitableFor: form.suitableFor,
      notes: form.notes,
      latePolicy: form.latePolicy,
      dm: mockDM,
      players: [],
      status: 'recruiting',
      createdAt: new Date().toISOString(),
      shareCode: generateShareCode()
    };
    setTrips(prev => [newTrip, ...prev]);
    console.log('[TripStore] 创建新车次:', newTrip.id, newTrip.scriptName);
    return newTrip;
  }, []);

  const updatePlayerStatus = useCallback((tripId: string, playerId: string, status: PlayerStatus) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const updatedPlayers = trip.players.map(p =>
        p.id === playerId ? { ...p, status } : p
      );
      const confirmedCount = updatedPlayers.filter(p => p.status === 'confirmed').length;
      const availableSeats = trip.totalSeats - confirmedCount;
      const newStatus = availableSeats <= 0 ? 'full' : 'recruiting';
      console.log('[TripStore] 更新玩家状态:', { tripId, playerId, status, availableSeats });
      return {
        ...trip,
        players: updatedPlayers,
        availableSeats: Math.max(0, availableSeats),
        status: newStatus as Trip['status']
      };
    }));
  }, []);

  const getTripById = useCallback((id: string): Trip | undefined => {
    return trips.find(trip => trip.id === id);
  }, [trips]);

  const addPlayer = useCallback((tripId: string, playerData: Omit<Player, 'id' | 'status' | 'applyTime'>) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const newPlayer: Player = {
        ...playerData,
        id: generateId(),
        status: 'pending',
        applyTime: new Date().toLocaleString('zh-CN')
      };
      console.log('[TripStore] 新增玩家报名:', { tripId, playerName: playerData.name });
      return {
        ...trip,
        players: [...trip.players, newPlayer]
      };
    }));
  }, []);

  const sendNotification = useCallback((tripId: string, type: 'reminder' | 'notes' | 'policy') => {
    console.log('[TripStore] 发送通知:', { tripId, type });
  }, []);

  return (
    <TripContext.Provider value={{
      trips,
      currentTrip,
      setCurrentTrip,
      createTrip,
      updatePlayerStatus,
      getTripById,
      addPlayer,
      sendNotification
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTripStore = (): TripContextType => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripStore must be used within a TripProvider');
  }
  return context;
};
