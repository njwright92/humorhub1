// lib/types.ts
export type Event = {
  id: string;
  name: string;
  location: string;
  date: string;
  lat?: number; // Optional for saved events
  lng?: number; // Optional for saved events
  details: string;
  isRecurring?: boolean;
  festival?: boolean;
  isMusic?: boolean;
  numericTimestamp?: number;
  googleTimestamp?: string | number | Date;
  savedAt?: string; // Only on saved events
};

export type SavedEvent = Event;

// Add to lib/types.ts
export interface LatLng {
  lat: number;
  lng: number;
}

export type CityCoordinates = {
  [key: string]: { lat: number; lng: number };
};

export type MicFinderData = {
  events: Event[];
  cityCoordinates: CityCoordinates;
};

export type SaveEventResult = {
  success: boolean;
  error?: string;
};
