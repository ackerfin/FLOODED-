 import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
 import { getOrCreateDevice, getSettings, updateSettings, getMedicalProfile, saveMedicalProfile, getAllSOSReports, getPendingSOSReports } from '@/lib/db';
 import { startAutoSync, stopAutoSync, syncPendingReports, isOnline } from '@/lib/sync';
 import { simulateNearbyDevices, refreshNearbyDevices, getNearbyDevices as fetchNearbyDevices } from '@/lib/mesh';
 import type { Device, AppSettings, MedicalProfile, SOSReport, NearbyDevice } from '@/types';
 
 interface AppContextType {
   device: Device | null;
   settings: AppSettings | null;
   medicalProfile: MedicalProfile | null;
   sosReports: SOSReport[];
   pendingCount: number;
   nearbyDevices: NearbyDevice[];
   isOnline: boolean;
   isLoading: boolean;
   language: 'vi' | 'en';
   
   // Actions
   updateAppSettings: (updates: Partial<AppSettings>) => Promise<void>;
   updateMedicalProfile: (profile: MedicalProfile) => Promise<void>;
   refreshReports: () => Promise<void>;
   refreshNearby: () => Promise<void>;
   triggerSync: () => Promise<{ success: boolean; syncedCount: number }>;
   setLanguage: (lang: 'vi' | 'en') => void;
 }
 
 const AppContext = createContext<AppContextType | undefined>(undefined);
 
 export function AppProvider({ children }: { children: React.ReactNode }) {
   const [device, setDevice] = useState<Device | null>(null);
   const [settings, setSettings] = useState<AppSettings | null>(null);
   const [medicalProfile, setMedicalProfile] = useState<MedicalProfile | null>(null);
   const [sosReports, setSosReports] = useState<SOSReport[]>([]);
   const [pendingCount, setPendingCount] = useState(0);
   const [nearbyDevices, setNearbyDevices] = useState<NearbyDevice[]>([]);
   const [online, setOnline] = useState(isOnline());
   const [isLoading, setIsLoading] = useState(true);
   const [language, setLanguageState] = useState<'vi' | 'en'>('vi');
 
   // Initialize
   useEffect(() => {
     async function init() {
       try {
         const [dev, set, profile, reports, pending, nearby] = await Promise.all([
           getOrCreateDevice(),
           getSettings(),
           getMedicalProfile(),
           getAllSOSReports(),
           getPendingSOSReports(),
           simulateNearbyDevices(),
         ]);
 
         setDevice(dev);
         setSettings(set);
         setMedicalProfile(profile);
         setSosReports(reports.reverse()); // Newest first
         setPendingCount(pending.length);
         setNearbyDevices(nearby);
         setLanguageState(set.language);
 
         // Start auto-sync
         if (!set.lowPowerMode) {
           startAutoSync(set.syncIntervalMs);
         }
       } catch (error) {
         console.error('Failed to initialize app:', error);
       } finally {
         setIsLoading(false);
       }
     }
 
     init();
 
     // Online/offline listeners
     const handleOnline = () => setOnline(true);
     const handleOffline = () => setOnline(false);
     
     window.addEventListener('online', handleOnline);
     window.addEventListener('offline', handleOffline);
 
     return () => {
       stopAutoSync();
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
     };
   }, []);
 
   const updateAppSettings = useCallback(async (updates: Partial<AppSettings>) => {
     await updateSettings(updates);
     const newSettings = await getSettings();
     setSettings(newSettings);
 
     if (updates.lowPowerMode !== undefined) {
       if (updates.lowPowerMode) {
         stopAutoSync();
       } else {
         startAutoSync(newSettings.syncIntervalMs);
       }
     }
 
     if (updates.language) {
       setLanguageState(updates.language);
     }
   }, []);
 
   const updateMedicalProfileHandler = useCallback(async (profile: MedicalProfile) => {
     await saveMedicalProfile(profile);
     setMedicalProfile(profile);
   }, []);
 
   const refreshReports = useCallback(async () => {
     const [reports, pending] = await Promise.all([
       getAllSOSReports(),
       getPendingSOSReports(),
     ]);
     setSosReports(reports.reverse());
     setPendingCount(pending.length);
   }, []);
 
   const refreshNearby = useCallback(async () => {
     const nearby = await refreshNearbyDevices();
     setNearbyDevices(nearby);
   }, []);
 
   const triggerSync = useCallback(async () => {
     const result = await syncPendingReports();
     await refreshReports();
     return result;
   }, [refreshReports]);
 
   const setLanguage = useCallback((lang: 'vi' | 'en') => {
     updateAppSettings({ language: lang });
   }, [updateAppSettings]);
 
   return (
     <AppContext.Provider
       value={{
         device,
         settings,
         medicalProfile,
         sosReports,
         pendingCount,
         nearbyDevices,
         isOnline: online,
         isLoading,
         language,
         updateAppSettings,
         updateMedicalProfile: updateMedicalProfileHandler,
         refreshReports,
         refreshNearby,
         triggerSync,
         setLanguage,
       }}
     >
       {children}
     </AppContext.Provider>
   );
 }
 
 export function useApp() {
   const context = useContext(AppContext);
   if (!context) {
     throw new Error('useApp must be used within an AppProvider');
   }
   return context;
 }