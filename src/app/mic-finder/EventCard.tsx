import type { Event } from "../lib/types";

export default function EventCard({
  event,
  onSave,
}: {
  event: Event;
  onSave: (event: Event) => void;
}) {
  const sanitizedDetails = event.sanitizedDetails ?? event.details;

  return (
    <article className="card-base mb-4 grid justify-items-center gap-2 border-stone-600 p-2 text-center">
      <h3 className="text-lg text-amber-600 md:text-xl">{event.name}</h3>
      <p className="text-sm">
        <span aria-hidden="true">📅 </span>
        <span className="sr-only">Date: </span>
        {event.date}
      </p>
      <p className="text-sm">
        <span aria-hidden="true">📍 </span>
        <span className="sr-only">Location: </span>
        {event.location}
      </p>
      <div className="w-full px-2 text-sm">
        <span className="mb-1 block font-bold">
          <span aria-hidden="true">ℹ️ </span>
          Details:
        </span>
        <div
          className="wrap-break-word [&_a]:text-blue-400"
          dangerouslySetInnerHTML={{ __html: sanitizedDetails }}
        />
      </div>
      <button
        type="button"
        onClick={() => onSave(event)}
        className="btn-amber my-2 px-3 py-1.5"
        aria-label={`Save ${event.name}`}
      >
        Save Event
      </button>
    </article>
  );
}
