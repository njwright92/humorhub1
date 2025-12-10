export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function normalizeCityName(name: string): string {
  return name.trim();
}

export function parseEventDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return undefined;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

export function extractCityFromLocation(location: string): string {
  return location.split(",")[1]?.trim() || "";
}
