export type LatLng = {
  lat: number;
  lng: number;
};

export type EventSubmission = {
  id: string;
  name: string;
  location: string;
  date: string | null;
  details: string;
  isRecurring: boolean;
  isFestival: boolean;
  email: string;
  timestamp: string;
  isOther?: boolean;
};

export type StoredEvent = EventSubmission & {
  lat?: number;
  lng?: number;
  submissionDate: string;
};

export type Event = {
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
};

export type MapEvent = Pick<
  Event,
  | "id"
  | "name"
  | "location"
  | "date"
  | "lat"
  | "lng"
  | "details"
  | "isFestival"
  | "isMusic"
>;

export type ProfileData = {
  name: string;
  bio: string;
  profileImageUrl: string;
};

export type PollCounts = {
  yesCount: number;
  noCount: number;
  totalCount: number;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  signedIn?: boolean;
  uid?: string;
  email?: string;
};

export type CityCoordinates = Record<string, LatLng>;

import { EVENT_CATEGORIES, NEWS_CATEGORIES } from "./constants";

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type EventsByTab = Record<EventCategory, Event[]>;

export type MicFinderData = {
  events: Event[];
  cityCoordinates: CityCoordinates;
  eventsByTab: EventsByTab;
};

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

export type MicFinderFilterResult = {
  baseEvents: Event[];
  recurringEvents: Event[];
  oneTimeEvents: Event[];
  allCityEvents: Event[];
};

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export type NewsArticle = {
  uuid: string;
  title: string;
  url?: string;
  description: string;
  image_url?: string;
  source?: string;
};
