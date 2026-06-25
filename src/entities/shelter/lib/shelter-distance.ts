import { hasShelterCoords, ShelterDto } from '../schema';

export type LatLng = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
const toRadians = (deg: number): number => (deg * Math.PI) / 180;

export const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const attachDistance = (shelters: ShelterDto[], origin?: LatLng): ShelterDto[] =>
  origin
    ? shelters.map((shelter) => ({
        ...shelter,
        distance: hasShelterCoords(shelter)
          ? haversineKm(origin.latitude, origin.longitude, shelter.latitude, shelter.longitude)
          : shelter.distance
      }))
    : shelters;

export const filterWithinKm = (shelters: ShelterDto[], km: number): ShelterDto[] =>
  shelters.filter((shelter) => shelter.distance != null && shelter.distance <= km);

export const sortByDistance = (shelters: ShelterDto[]): ShelterDto[] =>
  [...shelters].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
