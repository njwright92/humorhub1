import Link from "next/link";
import type { Event } from "@/app/lib/types";

function SavedEventCard({
  event,
  onDelete,
}: {
  event: Event;
  onDelete: (id: string, name: string) => void;
}) {
  // Logic: "Business, City" logic is baked into the storage, but we ensure the link is clean
  const city = event.location.split(",")[1]?.trim() || "";
  const mapHref = `/mic-finder?city=${encodeURIComponent(city)}`;

  return (
    <article className="card-base group flex items-start justify-between border-stone-600 bg-stone-900/50 p-4 transition-colors hover:border-amber-700">
      <div className="text-left">
        <h3 className="font-bold text-amber-600">{event.name}</h3>
        <p className="mt-1 text-sm text-stone-300">📍 {event.location}</p>
        <p className="mt-1 text-xs text-stone-500">📅 {event.date}</p>
      </div>
      <div className="flex flex-col items-end gap-3">
        <Link
          href={mapHref}
          className="text-xs text-stone-400 underline hover:text-white"
        >
          View on Map
        </Link>
        <button
          onClick={() => onDelete(event.id, event.name)}
          className="rounded border border-red-900/50 px-2 py-1 text-xs font-bold text-red-400 hover:bg-red-900/20"
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
    <section className="card-base min-h-125 border-stone-600 bg-stone-950/80 p-6 lg:col-span-2">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-200">
        <span>🎟️</span> Saved Events
        <span className="rounded-full bg-stone-800 px-2 py-1 text-xs">
          {savedEvents.length}
        </span>
      </h2>

      {savedEvents.length > 0 ? (
        <div className="grid gap-4">
          {savedEvents.map((event) => (
            <SavedEventCard key={event.id} event={event} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="grid h-64 place-content-center rounded-2xl border-2 border-dashed border-stone-700 text-stone-500">
          <p>No gigs saved yet.</p>
          <Link href="/mic-finder" className="mt-2 text-amber-600 underline">
            Go find a stage
          </Link>
        </div>
      )}
    </section>
  );
}
