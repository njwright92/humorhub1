import { buildEventFromData } from "./event-mappers";
import { sanitizeHtml } from "./sanitizeHtml";
import type { Event, EventData } from "./types";

type SavedEventDoc = {
  id: string;
  data: () => EventData;
};

export function mapSavedEventDocs(docs: SavedEventDoc[]): Event[] {
  const events: Event[] = [];

  for (const doc of docs) {
    const data = doc.data();
    const eventId =
      typeof data.eventId === "string" && data.eventId.length > 0
        ? data.eventId
        : doc.id;

    const event = buildEventFromData(eventId, data);
    event.sanitizedDetails = event.details ? sanitizeHtml(event.details) : "";
    events.push(event);
  }

  return events;
}
