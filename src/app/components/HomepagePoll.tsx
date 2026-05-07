"use client";

import { useEffect, useState, useCallback } from "react";
import { DEFAULT_POLL_ID } from "@/app/lib/constants";
import type { ApiResponse, PollCounts } from "@/app/lib/types";
import CloseIcon from "./CloseIcon";

const HIDE_AFTER_MS = 3000;
const FETCH_DELAY_MS = 1000;

const INITIAL_COUNTS: PollCounts = {
  yesCount: 0,
  noCount: 0,
  totalCount: 0,
};

async function fetchCounts(): Promise<PollCounts | null> {
  const res = await fetch(`/api/poll?id=${DEFAULT_POLL_ID}`);
  const data = (await res.json()) as ApiResponse<PollCounts>;
  return data.success && data.data ? data.data : null;
}

export default function HomepagePoll() {
  const [counts, setCounts] = useState<PollCounts>(INITIAL_COUNTS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [visible, setVisible] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const id = setTimeout(async () => {
      try {
        const data = await fetchCounts();
        if (!cancelled && data) setCounts(data);
      } catch {
        // silently fail — poll is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, FETCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!showResults || loading) return;
    const timer = setTimeout(() => setVisible(false), HIDE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [showResults, loading]);

  const submitResponse = useCallback(
    async (answer: "yes" | "no") => {
      if (submitting || showResults) return;
      setSubmitting(true);
      setErrorMsg(null);

      try {
        const res = await fetch("/api/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pollId: DEFAULT_POLL_ID, answer }),
        });
        const data = (await res.json()) as ApiResponse<PollCounts>;

        if (!data.success || !data.data) {
          if (data.error === "You already voted recently.") {
            const freshCounts = await fetchCounts();
            if (freshCounts) {
              setCounts(freshCounts);
              setShowResults(true);
              setErrorMsg(data.error);
              return;
            }
          }
          throw new Error(data.error || "Unable to record vote");
        }

        setCounts(data.data);
        setShowResults(true);
      } catch (error) {
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Couldn't record your vote. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, showResults],
  );

  if (!visible) return null;

  const total = counts.totalCount;
  const yesPercent = total ? Math.round((counts.yesCount / total) * 100) : 0;
  const noPercent = total ? 100 - yesPercent : 0;

  return (
    <div className="animate-slide-in relative grid w-full max-w-md gap-2 rounded-2xl border border-stone-600 bg-stone-900/90 p-3 shadow-xl">
      <button
        type="button"
        aria-label="Close poll"
        onClick={() => setVisible(false)}
        className="absolute top-1 right-1"
      >
        <CloseIcon className="size-4" />
      </button>

      <h2 className="mt-2 text-center font-bold whitespace-nowrap text-amber-700 lg:text-lg">
        Is crowd work real stand-up?
      </h2>

      <div className="grid auto-cols-fr grid-flow-col gap-2">
        <button
          type="button"
          disabled={submitting || showResults}
          onClick={() => submitResponse("yes")}
          className="rounded-2xl bg-amber-700 px-2 py-1.5 font-bold text-stone-900 transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          Yes
        </button>
        <button
          type="button"
          disabled={submitting || showResults}
          onClick={() => submitResponse("no")}
          className="rounded-2xl border border-stone-600 bg-stone-900 px-2 py-1.5 font-bold text-zinc-200 transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
        >
          No
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm font-semibold text-red-300">{errorMsg}</p>
      )}

      {showResults ? (
        <div className="grid gap-2 rounded-2xl bg-stone-900/90 p-2 sm:gap-3">
          <ResultBar
            label="Yes"
            percent={loading ? null : yesPercent}
            color="bg-amber-700"
          />
          <ResultBar
            label="No"
            percent={loading ? null : noPercent}
            color="bg-stone-300"
          />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-stone-600 bg-stone-800/90 p-2 text-sm text-zinc-200">
          Vote to see the general consensus.
        </p>
      )}
    </div>
  );
}

function ResultBar({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number | null;
  color: string;
}) {
  const display = percent === null ? "…" : `${percent}%`;

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-sm font-semibold text-zinc-200">
        <span>{label}</span>
        <span>{display}</span>
      </div>
      <div className="h-2 rounded-full bg-stone-800/90">
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-500 ease-out motion-reduce:transition-none`}
          style={{ width: `${percent ?? 0}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
