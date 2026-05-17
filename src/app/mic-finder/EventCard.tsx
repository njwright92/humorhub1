import { memo } from "react";
import type { Event } from "../lib/types";

function EventCard({
  event,
  onSave,
}: {
  event: Event;
  onSave: (event: Event) => void;
}) {
  const sanitizedDetails = event.sanitizedDetails ?? event.details;

  return (
    <article className="card-base mb-4 grid justify-items-center gap-2 border-stone-700 p-2 text-center contain-content">
      <h3 className="text-lg leading-tight text-amber-700 md:text-xl">
        {event.name}
      </h3>
      <p className="text-sm leading-snug">
        <span aria-hidden="true">📅 </span>
        <time className="sr-only">Date: </time>
        {event.date}
      </p>
      <p className="text-sm leading-snug">
        <span aria-hidden="true">📍 </span>
        <span className="sr-only">Location: </span>
        {event.location}
      </p>
      <p className="w-full px-2 text-sm">
        <strong className="mb-1 block leading-snug">
          <span aria-hidden="true">ℹ️ </span>
          Details:
        </strong>
        <span
          className="block leading-relaxed wrap-break-word [&_a]:text-blue-400"
          dangerouslySetInnerHTML={{ __html: sanitizedDetails }}
        />
      </p>
      <button
        type="button"
        onClick={() => onSave(event)}
        className="btn-primary my-2 py-1.5"
        aria-label={`Save ${event.name}`}
      >
        Save Event
      </button>
    </article>
  );
}

export default memo(EventCard);
