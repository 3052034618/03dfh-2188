import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import type { Trip, Player, CreateTripForm, PlayerStatus, NotificationType, NotificationRecord } from '@/types';
import { mockTrips, mockDM } from '@/data/mock';
import { generateId, generateShareCode, formatDate, getNotificationTypeName, getNowTimeString } from '@/utils';

const STORAGE_KEY = 'dm_trips_data';
const STORAGE_INIT_FLAG = 'dm_trips_initialized';

interface TripContextType {
  trips: Trip[];
  isLoading: boolean;
  refreshTrips: () => void;
  createTrip: (form: CreateTripForm) => Trip;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Trip | undefined;
  updatePlayerStatus: (tripId: string, playerId: string, status: PlayerStatus) => Trip | undefined;
  updatePlayer: (tripId: string, playerId: string, updates: Partial<Player>) => Trip | undefined;
  getTripById: (id: string) => Trip | undefined;
  addPlayer: (tripId: string, player: Omit<Player, 'id' | 'status' | 'applyTime'>) => Trip | undefined;
  sendNotification: (tripId: string, type: NotificationType, content: string) => Trip | undefined;
  getNotifications: (tripId: string) => NotificationRecord[];
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const loadTripsFromStorage = (): Trip[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      console.log('[TripStore] 从本地存储加载数据');
      return JSON.parse(data) as Trip[];
    }
  } catch (e) {
    console.error('[TripStore] 读取本地存储失败:', e);
  }
  return [];
};

const saveTripsToStorage = (trips: Trip[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(trips));
    console.log('[TripStore] 数据已保存到本地存储, 共', trips.length, '个车次');
  } catch (e) {
    console.error('[TripStore] 保存本地存储失败:', e);
  }
};

const initializeTrips = (): Trip[] => {
  try {
    const initialized = Taro.getStorageSync(STORAGE_INIT_FLAG);
    const storedTrips = loadTripsFromStorage();

    if (!initialized && storedTrips.length === 0) {
      console.log('[TripStore] 首次初始化，加载示例数据');
      Taro.setStorageSync(STORAGE_INIT_FLAG, 'true');
      saveTripsToStorage(mockTrips);
      return mockTrips;
    }

    return storedTrips;
  } catch (e) {
    console.error('[TripStore] 初始化失败:', e);
    return mockTrips;
  }
};

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialTrips = initializeTrips();
    setTrips(initialTrips);
    setIsLoading(false);
    console.log('[TripStore] 初始化完成, 共', initialTrips.length, '个车次');
  }, []);

  const saveAndUpdate = useCallback((newTrips: Trip[]) => {
    setTrips(newTrips);
    saveTripsToStorage(newTrips);
  }, []);

  const refreshTrips = useCallback(() => {
    const latestTrips = loadTripsFromStorage();
    setTrips(latestTrips);
    console.log('[TripStore] 刷新数据, 共', latestTrips.length, '个车次');
  }, []);

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
      notifications: [],
      status: 'recruiting',
      createdAt: getNowTimeString(),
      shareCode: generateShareCode()
    };

    const newTrips = [newTrip, ...trips];
    saveAndUpdate(newTrips);
    console.log('[TripStore] 创建新车次:', newTrip.id, newTrip.scriptName);
    return newTrip;
  }, [trips, saveAndUpdate]);

  const updateTrip = useCallback((tripId: string, updates: Partial<Trip>): Trip | undefined => {
    let updatedTrip: Trip | undefined;

    const newTrips = trips.map(trip => {
      if (trip.id !== tripId) return trip;

      updatedTrip = {
        ...trip,
        ...updates
      };

      console.log('[TripStore] 更新车次:', tripId, updates);
      return updatedTrip;
    });

    saveAndUpdate(newTrips);
    return updatedTrip;
  }, [trips, saveAndUpdate]);

  const updatePlayer = useCallback((tripId: string, playerId: string, updates: Partial<Player>): Trip | undefined => {
    let updatedTrip: Trip | undefined;

    const newTrips = trips.map(trip => {
      if (trip.id !== tripId) return trip;

      const updatedPlayers = trip.players.map(p =>
        p.id === playerId ? { ...p, ...updates } : p
      );

      let finalPlayers = updatedPlayers;
      let finalStatus = trip.status;
      let finalAvailableSeats = trip.availableSeats;

      if (updates.status) {
        const confirmedCount = updatedPlayers.filter(p => p.status === 'confirmed').length;
        finalAvailableSeats = trip.totalSeats - confirmedCount;
        finalStatus = (finalAvailableSeats <= 0 ? 'full' : 'recruiting') as Trip['status'];
      }

      updatedTrip = {
        ...trip,
        players: finalPlayers,
        availableSeats: Math.max(0, finalAvailableSeats),
        status: finalStatus
      };

      console.log('[TripStore] 更新玩家信息:', { tripId, playerId, updates });
      return updatedTrip;
    });

    saveAndUpdate(newTrips);
    return updatedTrip;
  }, [trips, saveAndUpdate]);

  const updatePlayerStatus = useCallback((tripId: string, playerId: string, status: PlayerStatus): Trip | undefined => {
    let updatedTrip: Trip | undefined;

    const newTrips = trips.map(trip => {
      if (trip.id !== tripId) return trip;

      const updatedPlayers = trip.players.map(p =>
        p.id === playerId ? { ...p, status } : p
      );
      const confirmedCount = updatedPlayers.filter(p => p.status === 'confirmed').length;
      const availableSeats = trip.totalSeats - confirmedCount;
      const newStatus = availableSeats <= 0 ? 'full' : 'recruiting';

      updatedTrip = {
        ...trip,
        players: updatedPlayers,
        availableSeats: Math.max(0, availableSeats),
        status: newStatus as Trip['status']
      };

      console.log('[TripStore] 更新玩家状态:', {
        tripId,
        playerId,
        status,
        availableSeats: Math.max(0, availableSeats)
      });

      return updatedTrip;
    });

    saveAndUpdate(newTrips);
    return updatedTrip;
  }, [trips, saveAndUpdate]);

  const getTripById = useCallback((id: string): Trip | undefined => {
    return trips.find(trip => trip.id === id);
  }, [trips]);

  const addPlayer = useCallback((tripId: string, playerData: Omit<Player, 'id' | 'status' | 'applyTime'>): Trip | undefined => {
    let updatedTrip: Trip | undefined;

    const newTrips = trips.map(trip => {
      if (trip.id !== tripId) return trip;

      const newPlayer: Player = {
        ...playerData,
        id: generateId(),
        status: 'pending',
        applyTime: getNowTimeString()
      };

      updatedTrip = {
        ...trip,
        players: [...trip.players, newPlayer]
      };

      console.log('[TripStore] 新增玩家报名:', { tripId, playerName: playerData.name });
      return updatedTrip;
    });

    saveAndUpdate(newTrips);
    return updatedTrip;
  }, [trips, saveAndUpdate]);

  const sendNotification = useCallback((tripId: string, type: NotificationType, content: string): Trip | undefined => {
    let updatedTrip: Trip | undefined;

    const newTrips = trips.map(trip => {
      if (trip.id !== tripId) return trip;

      const confirmedPlayers = trip.players.filter(p => p.status === 'confirmed');
      const recipientNames = confirmedPlayers.map(p => p.name);

      const newNotification: NotificationRecord = {
        id: generateId(),
        type,
        typeName: getNotificationTypeName(type),
        content,
        sentAt: getNowTimeString(),
        recipientCount: confirmedPlayers.length,
        recipients: recipientNames
      };

      updatedTrip = {
        ...trip,
        notifications: [newNotification, ...trip.notifications]
      };

      console.log('[TripStore] 发送通知:', {
        tripId,
        type,
        recipientCount: confirmedPlayers.length
      });

      return updatedTrip;
    });

    saveAndUpdate(newTrips);
    return updatedTrip;
  }, [trips, saveAndUpdate]);

  const getNotifications = useCallback((tripId: string): NotificationRecord[] => {
    const trip = trips.find(t => t.id === tripId);
    return trip?.notifications || [];
  }, [trips]);

  return (
    <TripContext.Provider value={{
      trips,
      isLoading,
      refreshTrips,
      createTrip,
      updateTrip,
      updatePlayerStatus,
      updatePlayer,
      getTripById,
      addPlayer,
      sendNotification,
      getNotifications
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
