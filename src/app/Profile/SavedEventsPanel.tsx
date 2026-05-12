import Link from "next/link";
import type { Event } from "@/app/lib/types";
import { extractCityFromLocation } from "@/app/lib/utils";

function SavedEventCard({
  event,
  onDelete,
}: {
  event: Event;
  onDelete: (id: string, name: string) => void;
}) {
  const city = event.normalizedCity || extractCityFromLocation(event.location);
  const mapHref = city
    ? `/mic-finder?city=${encodeURIComponent(city)}`
    : "/mic-finder";

  return (
    <article className="card-muted group flex items-start justify-between transition-all hover:border-amber-700/50">
      <div className="text-left">
        <h3 className="text-lg text-amber-700">{event.name}</h3>
        <p className="text-sm opacity-80">📍 {event.location}</p>
        <p className="mt-1 text-xs opacity-60">📅 {event.date}</p>
      </div>
      <div className="flex flex-col items-end gap-4">
        <Link
          href={mapHref}
          className="text-xs font-bold text-green-500 underline hover:text-green-400"
        >
          View on Map
        </Link>
        <button
          onClick={() => onDelete(event.id, event.name)}
          className="text-xs font-bold text-red-500/70 hover:text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>
    </article>
  );
}

export default function SavedEventsPanel({
  savedEvents,
  onDelete,
}: {
  savedEvents: Event[];
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <section className="card-dark min-h-125 lg:col-span-2">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl">
          <span>🎟️</span> Saved Events
        </h2>
        <span className="rounded-full bg-stone-800 px-3 py-1 font-mono text-xs">
          {savedEvents.length}
        </span>
      </header>

      {savedEvents.length > 0 ? (
        <div className="grid gap-4">
          {savedEvents.map((event) => (
            <SavedEventCard key={event.id} event={event} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="grid h-64 place-content-center rounded-2xl border-2 border-dashed border-stone-800 text-stone-500">
          <p>No gigs saved yet.</p>
          <Link href="/mic-finder" className="mt-2 text-amber-700 underline">
            Go find a stage
          </Link>
        </div>
      )}
    </section>
  );
}
