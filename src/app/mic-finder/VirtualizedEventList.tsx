"use client";

import { useRef, memo } from "react"; // Added memo
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Event } from "../lib/types";
import EventCard from "./EventCard";

// FIX INP: Memoizing the card prevents React from re-drawing it every time
// the user scrolls if the data hasn't changed.
const MemoizedEventCard = memo(EventCard);

export default function VirtualizedEventList({
  events,
  onSave,
  className,
  ariaLabel,
}: {
  events: Event[];
  onSave: (event: Event) => void;
  className: string;
  ariaLabel: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      className={className}
      role="feed"
      aria-label={ariaLabel}
      style={{
        overflowAnchor: "none",
      }}
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const event = events[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={rowVirtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <MemoizedEventCard event={event} onSave={onSave} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
