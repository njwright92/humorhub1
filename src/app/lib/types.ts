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
  sanitizedDetails?: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  signedIn?: boolean;
  uid?: string;
  email?: string;
}

export type CityCoordinates = Record<string, LatLng>;

export type EventCategory = "Mics" | "Festivals" | "Other";

export type EventsByTab = Record<EventCategory, Event[]>;

export interface MicFinderData {
  events: Event[];
  cityCoordinates: CityCoordinates;
  eventsByTab: EventsByTab;
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

export interface MicFinderFilterResult {
  baseEvents: Event[];
  recurringEvents: Event[];
  oneTimeEvents: Event[];
  allCityEvents: Event[];
}

export type NewsCategory = "top_stories" | "all_news";

export interface NewsArticle {
  uuid: string;
  title: string;
  url: string;
  description: string;
  image_url?: string;
  source?: string;
}
