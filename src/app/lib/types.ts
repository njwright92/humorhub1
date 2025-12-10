export type Event = {
  id: string;
  name: string;
  location: string;
  date: string;
  lat: number;
  lng: number;
  details: string;
  isRecurring: boolean;
  festival: boolean;
  isMusic?: boolean;
  numericTimestamp?: number;
  googleTimestamp?: string | number | Date;
};

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
