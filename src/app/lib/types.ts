export interface LatLng {
  lat: number;
  lng: number;
}

export interface EventSubmission {
  id: string;
  name: string;
  location: string;
  date: string | null;
  details: string;
  isRecurring: boolean;
  isFestival: boolean;
  email: string;
  timestamp: string;
}

export interface StoredEvent extends EventSubmission {
  lat?: number;
  lng?: number;
  submissionDate: string;
}

export interface Event {
  id: string;
  name: string;
  location: string;
  date: string;
  lat: number;
  lng: number;
  details: string;
  isRecurring: boolean;
  isFestival: boolean;
  isMusic: boolean;
  numericTimestamp: number;
  googleTimestamp?: GoogleTimestamp;
  locationLower: string;
  normalizedCity: string;
  isSpokaneClub: boolean;
  recurringDow: number | null;
  dateMs: number | null;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export type CityCoordinates = Record<string, LatLng>;

export interface MicFinderData {
  events: Event[];
  cityCoordinates: CityCoordinates;
}

export interface SavedEvent extends Event {
  userId: string;
  savedAt: string;
}

export type GoogleTimestamp =
  | string
  | number
  | Date
  | {
      toDate?: () => Date;
      seconds?: number;
      nanoseconds?: number;
    }
  | null
  | undefined;

export type EventData = Record<string, unknown>;
