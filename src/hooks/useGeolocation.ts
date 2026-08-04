 import { useState, useCallback } from 'react';
 
 interface Location {
   latitude: number;
   longitude: number;
   accuracy?: number;
 }
 
 interface UseGeolocationReturn {
   location: Location | null;
   error: string | null;
   isLoading: boolean;
   getLocation: () => Promise<Location | null>;
 }
 
 export function useGeolocation(): UseGeolocationReturn {
   const [location, setLocation] = useState<Location | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);
 
   const getLocation = useCallback(async (): Promise<Location | null> => {
     if (!navigator.geolocation) {
       setError('Geolocation not supported');
       return null;
     }
 
     setIsLoading(true);
     setError(null);
 
     try {
       const position = await new Promise<GeolocationPosition>((resolve, reject) => {
         navigator.geolocation.getCurrentPosition(resolve, reject, {
           enableHighAccuracy: true,
           timeout: 10000,
           maximumAge: 0,
         });
       });
 
       const loc: Location = {
         latitude: position.coords.latitude,
         longitude: position.coords.longitude,
         accuracy: position.coords.accuracy,
       };
 
       setLocation(loc);
       return loc;
     } catch (err) {
       const message = err instanceof GeolocationPositionError 
         ? err.message 
         : 'Failed to get location';
       setError(message);
       return null;
     } finally {
       setIsLoading(false);
     }
   }, []);
 
   return { location, error, isLoading, getLocation };
 }