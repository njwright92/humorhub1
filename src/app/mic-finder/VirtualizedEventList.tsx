"use client";

import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  type VirtualizerOptions,
} from "@tanstack/virtual-core";
import type { Event } from "../lib/types";
import EventCard from "./EventCard";

const useIsomorphicLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

function useVirtualizerInstance<
  TScrollElement extends Element,
  TItemElement extends Element,
>(options: VirtualizerOptions<TScrollElement, TItemElement>) {
  const rerender = useReducer(() => ({}), {})[1];
  const resolvedOptions = {
    ...options,
    onChange: (
      instance: Virtualizer<TScrollElement, TItemElement>,
      sync: boolean,
    ) => {
      rerender();
      options.onChange?.(instance, sync);
    },
  };

  const [instance] = useState(
    () => new Virtualizer<TScrollElement, TItemElement>(resolvedOptions),
  );
  instance.setOptions(resolvedOptions);

  useIsomorphicLayoutEffect(() => instance._didMount(), [instance]);
  useIsomorphicLayoutEffect(() => instance._willUpdate(), [instance]);

  return instance;
}

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

  const rowVirtualizer = useVirtualizerInstance<HTMLDivElement, HTMLElement>({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
  });

  return (
    <div
      ref={parentRef}
      className={className}
      role="feed"
      aria-label={ariaLabel}
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
              <EventCard event={event} onSave={onSave} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
