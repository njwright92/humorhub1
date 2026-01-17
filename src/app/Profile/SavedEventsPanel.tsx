import Link from "next/link";
import type { Event } from "@/app/lib/types";

const SavedEventCard = function SavedEventCard({
  event,
  isDeleting,
  onDelete,
}: {
  event: Event;
  isDeleting: boolean;
  onDelete: (id: string, name: string) => void;
}) {
  const city = event.location.split(",")[1]?.trim() || "";
  const mapHref = `/mic-finder?city=${encodeURIComponent(city)}`;
  const sanitizedDetails = event.sanitizedDetails ?? event.details;

  return (
    <article
      role="listitem"
      className="group card-shell card-border grid gap-4 border-stone-600 p-4 text-left hover:border-amber-700 sm:grid-cols-[1fr_auto]"
    >
      <div>
        <h3 className="mb-1 inline text-amber-600">{event.name}</h3>

        {event.isFestival && (
          <span className="ml-2 inline-block rounded-2xl bg-purple-900 px-2 py-0.5 align-middle text-xs font-bold text-purple-200 uppercase">
            Festival
          </span>
        )}

        {event.isMusic && (
          <span className="ml-2 inline-block rounded-2xl bg-blue-900 px-2 py-0.5 align-middle text-xs font-bold text-blue-200 uppercase">
            Music
          </span>
        )}

        <p className="mt-1 text-sm">
          <span aria-hidden="true">📍</span> {event.location}
        </p>

        <p className="mb-3 text-xs">
          <span aria-hidden="true">📅</span> {event.date}
          {event.isRecurring && " (Recurring)"}
        </p>

        {event.details && (
          <div
            className="line-clamp-2 text-sm group-hover:line-clamp-none"
            dangerouslySetInnerHTML={{ __html: sanitizedDetails }}
          />
        )}
      </div>

      <div className="grid auto-cols-auto grid-flow-col items-end justify-between gap-2 sm:grid-flow-row sm:justify-items-end">
        <Link
          prefetch={false}
          href={mapHref}
          className="text-sm underline transition-colors hover:text-amber-700"
        >
          Find on Map
        </Link>

        <button
          type="button"
          onClick={() => onDelete(event.id, event.name)}
          disabled={isDeleting}
          className="cursor-pointer rounded-2xl border border-red-500 px-3 py-1 text-sm font-semibold text-red-400 transition-colors hover:bg-red-900/50 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </article>
  );
};

function EventsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card-shell card-border grid animate-pulse gap-2 border-stone-600 p-4"
        >
          <div className="h-5 w-1/2 rounded-2xl bg-stone-700" />
          <div className="h-4 w-3/4 rounded-2xl bg-stone-700" />
          <div className="h-4 w-1/4 rounded-2xl bg-stone-700" />
        </div>
      ))}
      <span className="sr-only">Loading events...</span>
    </div>
  );
}

function EmptyEvents() {
  return (
    <div className="grid h-64 place-content-center gap-2 rounded-2xl border-2 border-dashed border-stone-600 text-center text-stone-400">
      <span className="text-4xl" aria-hidden="true">
        📭
      </span>
      <p className="text-lg font-semibold">No events saved yet</p>
      <p>Go find some mics to hit!</p>
      <Link href="/mic-finder" className="btn-amber mt-2 justify-self-center">
        Go to MicFinder
      </Link>
    </div>
  );
}

export default function SavedEventsPanel({
  savedEvents,
  isEventsLoading,
  deletingId,
  onDelete,
}: {
  savedEvents: Event[];
  isEventsLoading: boolean;
  deletingId: string | null;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <section className="card-shell card-border card-dark min-h-125 border-stone-600 bg-stone-950/80 p-4 lg:col-span-2">
      <h2 className="mb-4 grid grid-flow-col place-content-center gap-2 text-xl md:place-content-start">
        <span aria-hidden="true">🎟️</span>
        Saved Events
        {!isEventsLoading && (
          <span className="rounded-full bg-stone-800 px-2 py-1 text-xs">
            {savedEvents.length}
          </span>
        )}
      </h2>

      {isEventsLoading ? (
        <EventsSkeleton />
      ) : savedEvents.length > 0 ? (
        <div role="list" className="grid gap-4">
          {savedEvents.map((event) => (
            <SavedEventCard
              key={event.id}
              event={event}
              isDeleting={deletingId === event.id}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyEvents />
      )}
    </section>
  );
}
