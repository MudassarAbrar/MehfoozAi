/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared Lahore dummy location dataset used by Safe Corridor (#1),
 * Check-In POIs (#16-17), and Community Updates.
 * One coherent dataset reused by all location-dependent features (#43).
 */

export interface LahoreLocation {
  id: string;
  name: string;
  nameUrdu?: string;
  lat: number;
  lng: number;
  district: string;
  type: 'residential' | 'commercial' | 'educational' | 'landmark' | 'transit';
  safetyScore: number; // 0-100
  wellLitPercent: number;
  cctvPercent: number;
  policeNearby: boolean;
  activeWomenCount: number;
  safeZonesCount: number;
}

/** Common Lahore locations for Safe Corridor route generation and Check-In POIs. */
export const LAHORE_LOCATIONS: LahoreLocation[] = [
  { id: 'liberty', name: 'Liberty Market', nameUrdu: 'لبرٹی مارکیٹ', lat: 31.5005, lng: 74.3570, district: 'Gulberg', type: 'commercial', safetyScore: 88, wellLitPercent: 85, cctvPercent: 78, policeNearby: true, activeWomenCount: 6, safeZonesCount: 3 },
  { id: 'gulberg', name: 'Gulberg III', nameUrdu: 'گلبرگ 3', lat: 31.5204, lng: 74.3587, district: 'Gulberg', type: 'residential', safetyScore: 91, wellLitPercent: 90, cctvPercent: 82, policeNearby: true, activeWomenCount: 8, safeZonesCount: 4 },
  { id: 'johar-town', name: 'Johar Town', nameUrdu: 'جوہر ٹاؤن', lat: 31.4753, lng: 74.2892, district: 'Lahore', type: 'residential', safetyScore: 85, wellLitPercent: 80, cctvPercent: 65, policeNearby: true, activeWomenCount: 5, safeZonesCount: 3 },
  { id: 'dha', name: 'DHA Phase 5', nameUrdu: 'ڈی ایچ اے فیز 5', lat: 31.4612, lng: 74.3845, district: 'Lahore', type: 'residential', safetyScore: 94, wellLitPercent: 95, cctvPercent: 90, policeNearby: true, activeWomenCount: 4, safeZonesCount: 5 },
  { id: 'model-town', name: 'Model Town', nameUrdu: 'ماڈل ٹاؤن', lat: 31.5680, lng: 74.3300, district: 'Lahore', type: 'residential', safetyScore: 89, wellLitPercent: 88, cctvPercent: 75, policeNearby: true, activeWomenCount: 5, safeZonesCount: 3 },
  { id: 'mall-road', name: 'Mall Road', nameUrdu: 'مال روڈ', lat: 31.5580, lng: 74.3460, district: 'Lahore', type: 'landmark', safetyScore: 82, wellLitPercent: 80, cctvPercent: 85, policeNearby: true, activeWomenCount: 7, safeZonesCount: 4 },
  { id: 'anarkali', name: 'Anarkali Bazaar', nameUrdu: 'انارکلی بازار', lat: 31.5620, lng: 74.3210, district: 'Lahore', type: 'commercial', safetyScore: 72, wellLitPercent: 65, cctvPercent: 50, policeNearby: true, activeWomenCount: 9, safeZonesCount: 2 },
  { id: 'wapda-town', name: 'Wapda Town', nameUrdu: 'واپڈا ٹاؤن', lat: 31.4700, lng: 74.2800, district: 'Lahore', type: 'residential', safetyScore: 86, wellLitPercent: 82, cctvPercent: 60, policeNearby: false, activeWomenCount: 3, safeZonesCount: 2 },
  { id: 'faisal-town', name: 'Faisal Town', nameUrdu: 'فیصل ٹاؤن', lat: 31.4900, lng: 74.3100, district: 'Lahore', type: 'residential', safetyScore: 87, wellLitPercent: 84, cctvPercent: 62, policeNearby: false, activeWomenCount: 4, safeZonesCount: 2 },
  { id: 'aiqbal-town', name: 'Allama Iqbal Town', nameUrdu: 'علامہ اقبال ٹاؤن', lat: 31.4800, lng: 74.2950, district: 'Lahore', type: 'residential', safetyScore: 83, wellLitPercent: 78, cctvPercent: 55, policeNearby: true, activeWomenCount: 4, safeZonesCount: 2 },
  { id: 'lahore-cantt', name: 'Lahore Cantt', nameUrdu: 'لاہور چھاونی', lat: 31.5480, lng: 74.3750, district: 'Lahore', type: 'transit', safetyScore: 92, wellLitPercent: 92, cctvPercent: 88, policeNearby: true, activeWomenCount: 3, safeZonesCount: 4 },
  { id: 'bahria-town', name: 'Bahria Town', nameUrdu: 'بہریہ ٹاؤن', lat: 31.4200, lng: 74.2100, district: 'Lahore', type: 'residential', safetyScore: 95, wellLitPercent: 96, cctvPercent: 92, policeNearby: true, activeWomenCount: 3, safeZonesCount: 5 },
  { id: 'mm-alam', name: 'MM Alam Road', nameUrdu: 'ایم ایم عالم روڈ', lat: 31.5135, lng: 74.3530, district: 'Gulberg', type: 'commercial', safetyScore: 90, wellLitPercent: 92, cctvPercent: 80, policeNearby: true, activeWomenCount: 7, safeZonesCount: 3 },
  { id: 'husn-banara', name: 'Hussain Banara', nameUrdu: 'حسین بانارہ', lat: 31.5350, lng: 74.3400, district: 'Lahore', type: 'landmark', safetyScore: 78, wellLitPercent: 70, cctvPercent: 55, policeNearby: false, activeWomenCount: 2, safeZonesCount: 1 },
  { id: 'minar-pakistan', name: 'Minar-e-Pakistan', nameUrdu: 'مینار پاکستان', lat: 31.5925, lng: 74.3150, district: 'Lahore', type: 'landmark', safetyScore: 80, wellLitPercent: 75, cctvPercent: 70, policeNearby: true, activeWomenCount: 6, safeZonesCount: 3 },
  { id: 'badshahi-mosque', name: 'Badshahi Mosque', nameUrdu: 'بادشاہی مسجد', lat: 31.5880, lng: 74.3100, district: 'Lahore', type: 'landmark', safetyScore: 84, wellLitPercent: 80, cctvPercent: 72, policeNearby: true, activeWomenCount: 5, safeZonesCount: 3 },
  { id: 'lahore-museum', name: 'Lahore Museum', nameUrdu: 'لاہور میوزیم', lat: 31.5780, lng: 74.3380, district: 'Lahore', type: 'landmark', safetyScore: 86, wellLitPercent: 82, cctvPercent: 68, policeNearby: true, activeWomenCount: 4, safeZonesCount: 2 },
  { id: 'railway-station', name: 'Lahore Junction Station', nameUrdu: 'لاہور ریلوے اسٹیشن', lat: 31.5720, lng: 74.3450, district: 'Lahore', type: 'transit', safetyScore: 70, wellLitPercent: 68, cctvPercent: 75, policeNearby: true, activeWomenCount: 4, safeZonesCount: 2 },
  { id: 'thokar', name: 'Thokar Niaz Baig', nameUrdu: 'ٹھوکر نیاز بیگ', lat: 31.4650, lng: 74.2350, district: 'Lahore', type: 'transit', safetyScore: 75, wellLitPercent: 72, cctvPercent: 58, policeNearby: true, activeWomenCount: 2, safeZonesCount: 1 },
  { id: 'valencia', name: 'Valencia Housing Society', nameUrdu: 'ویلنسیا ہاؤسنگ سوسائٹی', lat: 31.4350, lng: 74.2650, district: 'Lahore', type: 'residential', safetyScore: 90, wellLitPercent: 90, cctvPercent: 80, policeNearby: false, activeWomenCount: 3, safeZonesCount: 3 },
];

/**
 * Find locations matching a query string (used by Safe Corridor search).
 */
export function findLahoreLocations(query: string): LahoreLocation[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return LAHORE_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(q) ||
    (loc.nameUrdu && loc.nameUrdu.includes(query.trim())) ||
    loc.district.toLowerCase().includes(q) ||
    loc.type.toLowerCase().includes(q)
  );
}

/**
 * Get nearby POIs based on GPS coordinates using simple distance calculation.
 * Returns up to `limit` locations sorted by distance.
 */
export function getNearbyPOIs(lat: number, lng: number, limit = 6): (LahoreLocation & { distanceKm: number })[] {
  return LAHORE_LOCATIONS
    .map(loc => ({
      ...loc,
      distanceKm: haversineKm(lat, lng, loc.lat, loc.lng)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Generate dynamic safe routes based on origin and destination.
 * Returns 3 routes: safest, balanced, fastest.
 */
export function generateSafeRoutes(
  fromName: string,
  toName: string,
  fromCoords: { lat: number; lng: number },
  toCoords: { lat: number; lng: number }
): {
  safest: { safetyScore: number; durationMin: number; distanceKm: number; wellLit: number; cctv: number; police: boolean; women: number; zones: number };
  balanced: { safetyScore: number; durationMin: number; distanceKm: number; wellLit: number; cctv: number; police: boolean; women: number; zones: number };
  fastest: { safetyScore: number; durationMin: number; distanceKm: number; wellLit: number; cctv: number; police: boolean; women: number; zones: number };
} {
  const dist = haversineKm(fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng);
  const baseDist = Math.max(dist, 0.5);

  // Use destination safety data to influence route characteristics
  const destLoc = LAHORE_LOCATIONS.find(l =>
    toName.toLowerCase().includes(l.name.toLowerCase().split(' ')[0])
  );
  const destSafety = destLoc?.safetyScore ?? 80;
  const destWellLit = destLoc?.wellLitPercent ?? 75;
  const destCctv = destLoc?.cctvPercent ?? 60;

  // Seed variation from coordinates so different destinations produce different results
  const hash = Math.abs(Math.round(fromCoords.lat * 1000 + toCoords.lng * 1000)) % 10;

  return {
    safest: {
      safetyScore: Math.min(99, Math.round(destSafety * 0.98 + hash * 0.2)),
      durationMin: Math.round(baseDist * 5 + 8 + hash),
      distanceKm: Math.round(baseDist * 1.3 * 10) / 10,
      wellLit: Math.min(98, Math.round(destWellLit * 1.05)),
      cctv: Math.min(95, Math.round(destCctv * 1.1)),
      police: true,
      women: Math.max(3, Math.round(destSafety / 15)),
      zones: Math.max(2, Math.round(destSafety / 25)),
    },
    balanced: {
      safetyScore: Math.min(95, Math.round(destSafety * 0.88 + hash * 0.3)),
      durationMin: Math.round(baseDist * 3.5 + 5 + hash),
      distanceKm: Math.round(baseDist * 1.1 * 10) / 10,
      wellLit: Math.round(destWellLit * 0.9),
      cctv: Math.round(destCctv * 0.85),
      police: hash > 3,
      women: Math.max(2, Math.round(destSafety / 20)),
      zones: Math.max(1, Math.round(destSafety / 30)),
    },
    fastest: {
      safetyScore: Math.max(50, Math.round(destSafety * 0.7 - hash * 0.5)),
      durationMin: Math.round(baseDist * 2.5 + 3),
      distanceKm: Math.round(baseDist * 10) / 10,
      wellLit: Math.max(40, Math.round(destWellLit * 0.7)),
      cctv: Math.max(30, Math.round(destCctv * 0.6)),
      police: hash > 6,
      women: Math.max(0, Math.round(destSafety / 35)),
      zones: Math.max(0, Math.round(destSafety / 45)),
    },
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
