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
  details: string;
  lat?: number;
  lng?: number;
  isRecurring?: boolean;
  isFestival?: boolean;
  isMusic?: boolean;
  email?: string;
  timestamp?: string;
  numericTimestamp?: number;
  googleTimestamp?: string | number | Date;
  savedAt?: string;
  submissionDate?: string;
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
