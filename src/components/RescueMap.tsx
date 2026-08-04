import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SOSCase, RescueTeamAccount } from '@/lib/commandCenter';
import { severityMeta, teamStatusMeta } from '@/lib/commandCenter';
import type { StormZone } from '@/lib/stormZones';

interface RescueMapProps {
  cases: SOSCase[];
  teams: RescueTeamAccount[];
  stormZones?: StormZone[];
  onCaseClick?: (caseId: string) => void;
  onTeamClick?: (teamId: string) => void;
  vi?: boolean;
}

export default function RescueMap({ cases, teams, stormZones = [], onCaseClick, onTeamClick, vi = true }: RescueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routesRef = useRef<L.LayerGroup | null>(null);
  const stormRef = useRef<L.LayerGroup | null>(null);
  const hasFitRef = useRef(false);
  const userInteractingRef = useRef(false);

  // Init map ONCE
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [16.047079, 108.206230],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      touchZoom: true,
      dragging: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    routesRef.current = L.layerGroup().addTo(map);
    stormRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // User interaction guard
    const onInteractStart = () => { userInteractingRef.current = true; };
    const onInteractEnd = () => { setTimeout(() => { userInteractingRef.current = false; }, 500); };
    map.on('zoomstart', onInteractStart);
    map.on('movestart', onInteractStart);
    map.on('zoomend', onInteractEnd);
    map.on('moveend', onInteractEnd);

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      hasFitRef.current = false;
    };
  }, []);

  // Update markers when data changes — NO zoom reset
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markers = markersRef.current;
    const routes = routesRef.current;
    if (!map || !markers || !routes) return;

    markers.clearLayers();
    routes.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    // SOS case markers
    const activeCases = cases.filter(c => c.lat && !['CLOSED', 'DUPLICATE', 'FALSE_REPORT'].includes(c.status));
    activeCases.forEach(c => {
      const color = c.severity === 'RED' ? '#ef4444' : c.severity === 'ORANGE' ? '#f59e0b' : '#22c55e';
      const size = c.severity === 'RED' ? 16 : c.severity === 'ORANGE' ? 13 : 10;

      const icon = L.divIcon({
        className: 'custom-sos-marker',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);${c.severity === 'RED' ? 'animation:pulse 1.5s infinite;' : ''}"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([c.lat!, c.lng!], { icon }).addTo(markers);
      marker.bindPopup(`
        <div style="min-width:160px">
          <strong style="color:${color}">${c.severity}</strong> — ${c.reporterName}<br/>
          <small>${c.locationText}</small><br/>
          <small>${c.peopleCount} ${vi ? 'người' : 'people'}</small>
        </div>
      `);
      marker.on('click', () => {
        map.setView([c.lat!, c.lng!], 14, { animate: true });
        if (onCaseClick) onCaseClick(c.id);
      });
      bounds.push([c.lat!, c.lng!]);
    });

    // Team markers
    teams.filter(t => t.currentLocation && t.status !== 'OFFLINE').forEach(t => {
      const icon = L.divIcon({
        className: 'custom-team-marker',
        html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:2px solid #60a5fa;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">🚤</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([t.currentLocation!.lat, t.currentLocation!.lng], { icon }).addTo(markers);
      marker.bindPopup(`
        <div style="min-width:140px">
          <strong>🚤 ${t.name}</strong><br/>
          <small>${t.leaderName} • ${t.vehicleType}</small><br/>
          <small>${teamStatusMeta[t.status][vi ? 'vi' : 'en']}</small>
        </div>
      `);
      marker.on('click', () => {
        map.setView([t.currentLocation!.lat, t.currentLocation!.lng], 14, { animate: true });
        if (onTeamClick) onTeamClick(t.id);
      });
      bounds.push([t.currentLocation!.lat, t.currentLocation!.lng]);

      // Route: team → assigned SOS case
      if (t.assignedCaseId) {
        const assignedCase = cases.find(c => c.id === t.assignedCaseId);
        if (assignedCase && assignedCase.lat && !['CLOSED', 'DUPLICATE', 'FALSE_REPORT'].includes(assignedCase.status)) {
          L.polyline(
            [[t.currentLocation!.lat, t.currentLocation!.lng], [assignedCase.lat, assignedCase.lng!]],
            { color: '#3b82f6', weight: 3, dashArray: '8 4', opacity: 0.7 }
          ).addTo(routes);
        }
      }
    });

    // Fit bounds ONLY on first load and if user is not interacting
    if (bounds.length > 0 && !hasFitRef.current && !userInteractingRef.current) {
      try {
        map.fitBounds(L.latLngBounds(bounds as L.LatLngTuple[]).pad(0.15));
        hasFitRef.current = true;
      } catch { /* fallback */ }
    }
  }, [cases, teams, vi, onCaseClick, onTeamClick]);

  // Update storm zones
  useEffect(() => {
    const map = mapInstanceRef.current;
    const storm = stormRef.current;
    if (!map || !storm) return;

    storm.clearLayers();
    stormZones.filter(sz => sz.active).forEach(sz => {
      const polygon = L.polygon(sz.polygonCoords as L.LatLngTuple[], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6 3',
      }).addTo(storm);
      polygon.bindPopup(`<strong style="color:#ef4444">⚠ ${sz.name}</strong>`);
    });
  }, [stormZones]);

  return (
    <div ref={mapRef} className="w-full h-[400px] rounded-lg z-0" style={{ position: 'relative' }} />
  );
}
