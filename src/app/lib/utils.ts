export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

export function parseTimestampToMs(value: unknown): number {
  if (!value) return 0;

  if (value instanceof Date) return value.getTime();

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    const time = parsed.getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (typeof value === "object") {
    const maybeTimestamp = value as {
      toDate?: () => Date;
      seconds?: number;
      nanoseconds?: number;
    };

    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().getTime();
    }

    if (typeof maybeTimestamp.seconds === "number") {
      const nanos =
        typeof maybeTimestamp.nanoseconds === "number"
          ? maybeTimestamp.nanoseconds
          : 0;
      return maybeTimestamp.seconds * 1000 + Math.floor(nanos / 1e6);
    }
  }

  return 0;
}

export function extractCityFromLocation(location: string): string {
  return location.split(",")[1]?.trim() || "";
}
