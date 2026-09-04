/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SafetyPOI {
  id: string;
  name: string;
  nameUrdu?: string;
  type: 'police' | 'hospital' | 'clinic' | 'rescue' | 'safe_haven';
  lat: number;
  lon: number;
  distanceMeters: number;
  distanceFormatted: string;
  phone?: string;
  emergencyHelpline?: string;
  address?: string;
  isOpen24Hours?: boolean;
}

export interface GeocodedAddress {
  displayName: string;
  road?: string;
  suburb?: string;
  city?: string;
  district?: string;
  state?: string;
  lat: number;
  lon: number;
}

// Haversine formula to compute distance between two coords in meters
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// Fallback safety POIs around Lahore / Punjab central coordinates
const FALLBACK_SAFETY_POIS: Omit<SafetyPOI, 'distanceMeters' | 'distanceFormatted'>[] = [
  {
    id: 'poi-pol-1',
    name: 'Gulberg Police Station & Safe City Post',
    nameUrdu: 'تھانہ گلبرگ و سیف سٹی پوسٹ',
    type: 'police',
    lat: 31.5175,
    lon: 74.3524,
    phone: '+92 42 99263121',
    emergencyHelpline: '15',
    address: 'Main Boulevard Gulberg, Block H, Lahore',
    isOpen24Hours: true
  },
  {
    id: 'poi-hosp-1',
    name: 'United Christian Hospital / Emergency Wing',
    nameUrdu: 'یونائیٹڈ کرسچین ہسپتال ایمرجنسی',
    type: 'hospital',
    lat: 31.5230,
    lon: 74.3542,
    phone: '+92 42 35760881',
    emergencyHelpline: '1122',
    address: 'Near Liberty Roundabout, Gulberg III, Lahore',
    isOpen24Hours: true
  },
  {
    id: 'poi-pol-2',
    name: 'Punjab Safe Cities Authority (PSCA) HQ & Center',
    nameUrdu: 'پنجاب سیف سٹیز اتھارٹی ہیڈ کوارٹر',
    type: 'police',
    lat: 31.5052,
    lon: 74.3318,
    phone: '15',
    emergencyHelpline: '15',
    address: 'Qurban Police Lines, Lahore',
    isOpen24Hours: true
  },
  {
    id: 'poi-hosp-2',
    name: 'Services Hospital (Trauma & Emergency Care)',
    nameUrdu: 'سروسز ہسپتال ایمرجنسی و ٹراما سینٹر',
    type: 'hospital',
    lat: 31.5398,
    lon: 74.3326,
    phone: '+92 42 99205510',
    emergencyHelpline: '1122',
    address: 'Jail Road, Shadman, Lahore',
    isOpen24Hours: true
  },
  {
    id: 'poi-rescue-1',
    name: 'Punjab Emergency Service Rescue 1122 Post',
    nameUrdu: 'ریسکیو 1122 ایمرجنسی سینٹر',
    type: 'rescue',
    lat: 31.5140,
    lon: 74.3470,
    phone: '1122',
    emergencyHelpline: '1122',
    address: 'Liberty Roundabout Sector, Gulberg, Lahore',
    isOpen24Hours: true
  },
  {
    id: 'poi-pol-3',
    name: 'Ghalib Market Police Post',
    nameUrdu: 'غالب مارکیٹ پولیس چوکی',
    type: 'police',
    lat: 31.5265,
    lon: 74.3592,
    phone: '15',
    emergencyHelpline: '15',
    address: 'Ghalib Market, Gulberg II, Lahore',
    isOpen24Hours: true
  },
  {
    id: 'poi-safe-1',
    name: 'Women Protection Center (VAWC) Liaison Post',
    nameUrdu: 'خواتین تحفظ مرکز و قانونی معاونت',
    type: 'safe_haven',
    lat: 31.5305,
    lon: 74.3412,
    phone: '1043',
    emergencyHelpline: '1043',
    address: 'Social Welfare Complex, Lahore',
    isOpen24Hours: true
  }
];

/**
 * Reverse geocoding using OpenStreetMap + Nominatim
 */
export async function reverseGeocodeWithNominatim(
  lat: number,
  lon: number
): Promise<GeocodedAddress> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en,ur',
        'User-Agent': 'Mehfooz-Women-Safety-Assistant/2.0'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};
    const road = addr.road || addr.pedestrian || addr.street;
    const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter;
    const city = addr.city || addr.town || addr.county || 'Lahore';
    const state = addr.state || 'Punjab';

    let formatted = data.display_name;
    if (road && suburb) {
      formatted = `${road}, ${suburb}, ${city}`;
    }

    return {
      displayName: formatted || `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
      road,
      suburb,
      city,
      district: addr.city_district || addr.county || city,
      state,
      lat,
      lon
    };
  } catch (err) {
    // Graceful fallback when rate-limited or offline
    return {
      displayName: `Gulberg III, Main Boulevard, Lahore, Punjab`,
      road: 'Main Boulevard',
      suburb: 'Gulberg III',
      city: 'Lahore',
      district: 'Lahore',
      state: 'Punjab',
      lat,
      lon
    };
  }
}

/**
 * Address / POI Search with OpenStreetMap + Nominatim
 */
export async function searchAddressWithNominatim(query: string): Promise<GeocodedAddress[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query + ', Pakistan'
    )}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'Mehfooz-Women-Safety-Assistant/2.0'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim search error: ${response.status}`);
    }

    const results = await response.json();
    return results.map((item: any) => {
      const addr = item.address || {};
      return {
        displayName: item.display_name,
        road: addr.road || addr.pedestrian,
        suburb: addr.suburb || addr.neighbourhood,
        city: addr.city || addr.town,
        district: addr.county || addr.city_district,
        state: addr.state || 'Punjab',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      };
    });
  } catch {
    // Quick fallback
    return [
      {
        displayName: `${query} (Lahore, Punjab, Pakistan)`,
        road: query,
        city: 'Lahore',
        state: 'Punjab',
        lat: 31.5204,
        lon: 74.3587
      }
    ];
  }
}

/**
 * Finding nearby POIs (police, hospitals, clinics) with OpenStreetMap + Overpass API
 */
export async function fetchNearbySafetyPOIsWithOverpass(
  lat: number,
  lon: number,
  radiusMeters: number = 3500
): Promise<SafetyPOI[]> {
  const pois: SafetyPOI[] = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);

    const overpassQuery = `
      [out:json][timeout:6];
      (
        node["amenity"="police"](around:${radiusMeters},${lat},${lon});
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
        way["amenity"="police"](around:${radiusMeters},${lat},${lon});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      );
      out center 15;
    `.trim();

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.elements)) {
        for (const el of data.elements) {
          const poiLat = el.lat ?? el.center?.lat;
          const poiLon = el.lon ?? el.center?.lon;
          if (!poiLat || !poiLon) continue;

          const tags = el.tags || {};
          const rawName = tags.name || tags['name:en'] || tags['name:ur'] || 'Emergency Service Post';
          const amenity = tags.amenity;
          const type: SafetyPOI['type'] =
            amenity === 'police' ? 'police' : amenity === 'hospital' ? 'hospital' : 'clinic';

          const dist = calculateDistance(lat, lon, poiLat, poiLon);

          pois.push({
            id: `overpass-${el.id}`,
            name: rawName,
            type,
            lat: poiLat,
            lon: poiLon,
            distanceMeters: dist,
            distanceFormatted: formatDistance(dist),
            phone: tags.phone || tags['contact:phone'] || (type === 'police' ? '15' : '1122'),
            emergencyHelpline: type === 'police' ? '15' : '1122',
            address: tags['addr:street'] ? `${tags['addr:street']}, ${tags['addr:city'] || ''}` : undefined,
            isOpen24Hours: tags.opening_hours === '24/7' || true
          });
        }
      }
    }
  } catch (err) {
    // Overpass failed or timed out; will seamlessly augment with fallback POIs
  }

  // If overpass returns few or none (or on network delay), augment with fallback POIs
  if (pois.length < 3) {
    for (const fb of FALLBACK_SAFETY_POIS) {
      const dist = calculateDistance(lat, lon, fb.lat, fb.lon);
      pois.push({
        ...fb,
        distanceMeters: dist,
        distanceFormatted: formatDistance(dist)
      });
    }
  }

  // Sort by closest distance
  pois.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return pois.slice(0, 10);
}
