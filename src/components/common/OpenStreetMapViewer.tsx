/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Cross, 
  PhoneCall, 
  RefreshCw, 
  Search, 
  Compass, 
  Layers, 
  Building2, 
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { 
  SafetyPOI, 
  GeocodedAddress, 
  fetchNearbySafetyPOIsWithOverpass, 
  reverseGeocodeWithNominatim,
  searchAddressWithNominatim,
  calculateDistance,
  formatDistance
} from '../../services/osmService';

interface OpenStreetMapViewerProps {
  currentLat?: number;
  currentLon?: number;
  destinationQuery?: string;
  destinationCoords?: { lat: number; lon: number };
  onLocationFound?: (coords: { lat: number; lon: number }, address: GeocodedAddress) => void;
  onDestinationSelect?: (coords: { lat: number; lon: number }, label: string) => void;
  isUrdu?: boolean;
  className?: string;
  showControls?: boolean;
  heightClass?: string;
}

export const OpenStreetMapViewer: React.FC<OpenStreetMapViewerProps> = ({
  currentLat = 31.5204,
  currentLon = 74.3587,
  destinationQuery,
  destinationCoords,
  onLocationFound,
  onDestinationSelect,
  isUrdu = false,
  className = '',
  showControls = true,
  heightClass = 'h-[320px] sm:h-[380px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const poiLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: currentLat,
    lon: currentLon
  });
  const [resolvedAddress, setResolvedAddress] = useState<GeocodedAddress | null>(null);
  const [pois, setPois] = useState<SafetyPOI[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'police' | 'hospital'>('all');
  const [isLoadingPois, setIsLoadingPois] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'standard' | 'dark'>('standard');
  const [selectedPoi, setSelectedPoi] = useState<SafetyPOI | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number>(18);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Tile layer URLs
  const standardTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lon],
        zoom: 15,
        zoomControl: false,
        attributionControl: true
      });

      // Add tile layer
      const tileLayer = L.tileLayer(mapStyle === 'standard' ? standardTileUrl : darkTileUrl, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      currentTileLayerRef.current = tileLayer;

      // Group for POI markers
      const poiGroup = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = poiGroup;

      mapInstanceRef.current = map;

      // Map click handler to pick destination
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setStatusMessage(isUrdu ? 'پتہ تلاش کیا جا رہا ہے...' : 'Resolving clicked location via Nominatim...');
        const addr = await reverseGeocodeWithNominatim(lat, lng);
        setStatusMessage(null);
        if (onDestinationSelect) {
          onDestinationSelect({ lat, lon: lng }, addr.displayName);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile style when switched
  useEffect(() => {
    if (!mapInstanceRef.current || !currentTileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    const newLayer = L.tileLayer(mapStyle === 'standard' ? standardTileUrl : darkTileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);
    currentTileLayerRef.current = newLayer;
  }, [mapStyle]);

  // 2. Fetch reverse geocode and POIs for coordinates
  const refreshLocationData = useCallback(async (lat: number, lon: number) => {
    // Reverse geocode with Nominatim
    try {
      const addr = await reverseGeocodeWithNominatim(lat, lon);
      setResolvedAddress(addr);
      if (onLocationFound) {
        onLocationFound({ lat, lon }, addr);
      }
    } catch (e) {
      console.warn('Nominatim reverse lookup error:', e);
    }

    // Fetch POIs with Overpass API
    setIsLoadingPois(true);
    try {
      const fetched = await fetchNearbySafetyPOIsWithOverpass(lat, lon, 3500);
      setPois(fetched);
    } catch (err) {
      console.warn('Overpass POI query error:', err);
    } finally {
      setIsLoadingPois(false);
    }
  }, [onLocationFound]);

  // 3. User Geolocation Watch / Trigger
  const handleLocateMe = useCallback(() => {
    setIsLocating(true);
    setStatusMessage(isUrdu ? 'GPS سگنل تلاش ہو رہا ہے...' : 'Acquiring GPS coordinates...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLat = pos.coords.latitude;
          const newLon = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 20);

          setCoords({ lat: newLat, lon: newLon });
          setGpsAccuracyMeters(accuracy);
          setIsLocating(false);
          setStatusMessage(isUrdu ? 'GPS لوکیشن لاک ہو گئی' : 'GPS Location Locked via Device');
          setTimeout(() => setStatusMessage(null), 3000);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newLat, newLon], 16, { duration: 1.2 });
          }

          refreshLocationData(newLat, newLon);
        },
        (error) => {
          console.warn('Geolocation failed or denied, using simulated Punjab coords', error);
          setIsLocating(false);
          setStatusMessage(isUrdu ? 'GPS اجازت نہ مل سکی - لاہور ڈیفالٹ استعمال کیا جا رہا ہے' : 'GPS unavailable - Defaulting to Lahore Center');
          setTimeout(() => setStatusMessage(null), 3500);
          refreshLocationData(coords.lat, coords.lon);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      setIsLocating(false);
      refreshLocationData(coords.lat, coords.lon);
    }
  }, [coords.lat, coords.lon, isUrdu, refreshLocationData]);

  // Trigger initial data refresh
  useEffect(() => {
    refreshLocationData(coords.lat, coords.lon);
  }, []);

  // 4. Update Markers on Map (User, POIs, Destination)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // A. User Marker with Pulsing GPS Beacon
    const userDivIcon = L.divIcon({
      className: 'custom-user-gps-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-[#FC7454] opacity-30 animate-ping"></div>
          <div class="absolute w-6 h-6 rounded-full bg-[#FC7454] opacity-50"></div>
          <div class="relative w-3.5 h-3.5 rounded-full bg-[#1C2C34] border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-1 h-1 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([coords.lat, coords.lon]);
    } else {
      userMarkerRef.current = L.marker([coords.lat, coords.lon], {
        icon: userDivIcon,
        zIndexOffset: 1000
      }).addTo(map);

      userMarkerRef.current.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <div class="font-extrabold text-[#1C2C34] flex items-center gap-1.5 mb-1">
            <span class="w-2 h-2 rounded-full bg-[#FC7454] animate-pulse"></span>
            <span>Your Real-Time GPS Location</span>
          </div>
          <p class="text-slate-600 text-[11px] font-medium leading-tight">
            ${resolvedAddress?.displayName || 'Gulberg III, Lahore, Punjab'}
          </p>
          <div class="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Lat: ${coords.lat.toFixed(4)}</span>
            <span>Lon: ${coords.lon.toFixed(4)}</span>
          </div>
        </div>
      `);
    }

    // B. Accuracy Circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng([coords.lat, coords.lon]);
      accuracyCircleRef.current.setRadius(gpsAccuracyMeters);
    } else {
      accuracyCircleRef.current = L.circle([coords.lat, coords.lon], {
        radius: gpsAccuracyMeters,
        color: '#FC7454',
        fillColor: '#FC7454',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 4'
      }).addTo(map);
    }

    // C. POIs Rendering
    if (poiLayerGroupRef.current) {
      poiLayerGroupRef.current.clearLayers();

      const filtered = pois.filter((p) => {
        if (selectedFilter === 'police') return p.type === 'police';
        if (selectedFilter === 'hospital') return p.type === 'hospital' || p.type === 'clinic';
        return true;
      });

      filtered.forEach((poi) => {
        const isPolice = poi.type === 'police';
        const isHospital = poi.type === 'hospital' || poi.type === 'clinic';
        const badgeColor = isPolice ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white';
        const iconSymbol = isPolice ? '🛡️' : '🏥';

        const poiIcon = L.divIcon({
          className: 'custom-poi-marker',
          html: `
            <div class="flex items-center justify-center w-7 h-7 rounded-xl ${badgeColor} shadow-md border-2 border-white transform transition hover:scale-110 cursor-pointer text-xs">
              <span>${iconSymbol}</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([poi.lat, poi.lon], { icon: poiIcon });
        marker.bindPopup(`
          <div class="p-1 font-sans text-xs max-w-[210px]">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                isPolice ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }">
                ${poi.type.toUpperCase()} • ${poi.distanceFormatted}
              </span>
              <span class="text-[10px] text-slate-500 font-mono">Open 24/7</span>
            </div>
            <h4 class="font-bold text-[#1C2C34] text-xs leading-snug">${poi.name}</h4>
            ${poi.address ? `<p class="text-[10px] text-slate-500 mt-0.5">${poi.address}</p>` : ''}
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
              <a href="tel:${poi.phone || poi.emergencyHelpline || '15'}" class="px-2 py-1 bg-[#1C2C34] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-[#FC7454] transition no-underline">
                <span>📞 Call ${poi.emergencyHelpline || '15'}</span>
              </a>
              <span class="text-[9px] text-slate-400 font-medium">Overpass API</span>
            </div>
          </div>
        `);

        marker.on('click', () => setSelectedPoi(poi));
        marker.addTo(poiLayerGroupRef.current!);
      });
    }

    // D. Destination Marker & Route Polyline
    if (destinationCoords) {
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-[#1C2C34] text-white shadow-lg border-2 border-white animate-bounce">
            <span class="text-xs">🏁</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([destinationCoords.lat, destinationCoords.lon]);
      } else {
        destinationMarkerRef.current = L.marker([destinationCoords.lat, destinationCoords.lon], {
          icon: destIcon
        }).addTo(map);
      }

      // Draw corridor line
      const latlngs: [number, number][] = [
        [coords.lat, coords.lon],
        [destinationCoords.lat, destinationCoords.lon]
      ];

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs(latlngs);
      } else {
        routeLineRef.current = L.polyline(latlngs, {
          color: '#FC7454',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 8'
        }).addTo(map);
      }
    } else {
      if (destinationMarkerRef.current) {
        map.removeLayer(destinationMarkerRef.current);
        destinationMarkerRef.current = null;
      }
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }
    }
  }, [coords, pois, selectedFilter, destinationCoords, resolvedAddress, gpsAccuracyMeters]);

  // Handle Nominatim Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchAddressWithNominatim(searchQuery);
    setSearchResults(results);
    setIsSearching(false);

    if (results.length > 0) {
      const first = results[0];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([first.lat, first.lon], 15);
      }
      if (onDestinationSelect) {
        onDestinationSelect({ lat: first.lat, lon: first.lon }, first.displayName);
      }
    }
  };

  const handleSelectSearchResult = (res: GeocodedAddress) => {
    setSearchResults([]);
    setSearchQuery(res.displayName);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([res.lat, res.lon], 16);
    }
    if (onDestinationSelect) {
      onDestinationSelect({ lat: res.lat, lon: res.lon }, res.displayName);
    }
  };

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#18242A] border border-[#BCD4D4]/70 dark:border-slate-800 shadow-sm ${className}`}>
      {/* Top Search & Source Bar */}
      {showControls && (
        <div className="p-2.5 sm:p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#131E24] space-y-2">
          {/* Nominatim Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'اوپن سٹریٹ میپ میں پتہ تلاش کریں...' : 'Search location via OpenStreetMap (Nominatim)...'}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white dark:bg-[#1C2C34] text-[#1C2C34] dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#FC7454] transition"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-3 py-2 rounded-xl bg-[#1C2C34] dark:bg-slate-700 hover:bg-[#FC7454] text-white text-[11px] font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
            >
              {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>{isUrdu ? 'تلاش' : 'Lookup'}</span>}
            </button>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-white dark:bg-[#1C2C34] border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 shadow-md space-y-1 z-30">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                {isUrdu ? 'نتائج (اوپن سٹریٹ میپ)' : 'Nominatim Results'}
              </div>
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSearchResult(res)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs cursor-pointer flex items-center justify-between transition"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[#1C2C34] dark:text-slate-200 truncate">{res.displayName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {res.lat.toFixed(4)}, {res.lon.toFixed(4)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#FC7454] uppercase flex-shrink-0">Set</span>
                </div>
              ))}
            </div>
          )}

          {/* Controls Bar: POI Filters, Locate Me, Refresh, Dark Mode */}
          <div className="flex items-center justify-between gap-1 flex-wrap text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-[#1C2C34] text-white'
                    : 'bg-white dark:bg-[#1C2C34] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUrdu ? 'تمام' : 'All POIs'} ({pois.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('police')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'police'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-[#1C2C34] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🛡️</span>
                <span>{isUrdu ? 'پولیس 15' : 'Police 15'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('hospital')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedFilter === 'hospital'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-[#1C2C34] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>🏥</span>
                <span>{isUrdu ? 'ہسپتال' : 'Hospitals'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* Overpass Refresh */}
              <button
                type="button"
                onClick={() => refreshLocationData(coords.lat, coords.lon)}
                disabled={isLoadingPois}
                className="p-1.5 rounded-lg bg-white dark:bg-[#1C2C34] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Refresh nearby safety POIs via Overpass API"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPois ? 'animate-spin text-[#FC7454]' : ''}`} />
              </button>

              {/* Map Theme Toggle */}
              <button
                type="button"
                onClick={() => setMapStyle(mapStyle === 'standard' ? 'dark' : 'standard')}
                className="p-1.5 rounded-lg bg-white dark:bg-[#1C2C34] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Switch Map Tiles (Standard OpenStreetMap / Clean Night)"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>

              {/* GPS Locate Me */}
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="px-2.5 py-1 rounded-lg bg-[#FC7454] hover:bg-[#FC7C54] text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                title="Center on my real GPS Location"
              >
                <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{isUrdu ? 'میرا مقام' : 'Locate Me'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Status Notification Pill */}
      {statusMessage && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/80 px-3 py-1.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
          <span className="font-medium truncate">{statusMessage}</span>
        </div>
      )}

      {/* The Leaflet / OpenStreetMap Container */}
      <div className="relative w-full overflow-hidden">
        <div ref={mapContainerRef} className={`w-full ${heightClass} z-10`} />

        {/* Live GPS Coordinate Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-auto bg-white/95 dark:bg-[#18242A]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm text-left max-w-[280px]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1C2C34] dark:text-slate-200">
              {isUrdu ? 'لائیو GPS مقام' : 'Live GPS Precision'}
            </span>
            <span className="text-[9px] text-slate-400 ml-auto font-mono">±{gpsAccuracyMeters}m</span>
          </div>

          <p className="text-[11px] font-semibold text-[#1C2C34] dark:text-slate-100 truncate leading-snug">
            {resolvedAddress?.displayName || 'Gulberg III, Main Boulevard, Lahore'}
          </p>

          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>{coords.lat.toFixed(4)}° N</span>
            <span>{coords.lon.toFixed(4)}° E</span>
          </div>
        </div>

        {/* Overpass Safety Status Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-auto bg-white/95 dark:bg-[#18242A]/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm text-right">
          <div className="text-[9px] font-extrabold uppercase text-[#FC7454] tracking-wider flex items-center justify-end gap-1">
            <ShieldCheck className="w-3 h-3 text-[#FC7454]" />
            <span>Overpass Safe POIs: {pois.length}</span>
          </div>
          <div className="text-[9px] text-slate-500 font-medium">
            OpenStreetMap Data
          </div>
        </div>
      </div>

      {/* Bottom Safety POIs Mini-Tray */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131E24]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#5A6E78] dark:text-slate-400">
            {isUrdu ? 'قریبی ایمرجنسی پوائنٹس (Overpass API)' : 'Closest Emergency POIs (Overpass API)'}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {isUrdu ? '24/7 فعال' : 'Active Responders Nearby'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
          {pois.slice(0, 4).map((poi) => {
            const isPolice = poi.type === 'police';
            return (
              <div
                key={poi.id}
                className="p-2 rounded-xl bg-white dark:bg-[#18242A] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs hover:border-[#BCD4D4] transition"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isPolice ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {isPolice ? 'POLICE 15' : 'HOSPITAL'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">
                      {poi.distanceFormatted}
                    </span>
                  </div>
                  <h5 className="font-bold text-[#1C2C34] dark:text-slate-200 text-[11px] truncate mt-0.5">
                    {poi.name}
                  </h5>
                </div>

                <a
                  href={`tel:${poi.phone || poi.emergencyHelpline || '15'}`}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-[#FC7454] hover:text-white text-[10px] font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1 flex-shrink-0 cursor-pointer"
                  title={`Call ${poi.name}`}
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
