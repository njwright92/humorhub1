"use client";

import { useEffect, useState } from "react";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type PollCounts = {
  yesCount: number;
  noCount: number;
  totalCount: number;
};

const POLL_ID = "homepage_v3";
const HIDE_AFTER_MS = 3000;

export default function HomepagePoll() {
  const [counts, setCounts] = useState<PollCounts>({
    yesCount: 0,
    noCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [visible, setVisible] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/poll?id=${POLL_ID}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as ApiResponse<PollCounts>;
        if (!cancelled && data.success && data.data) setCounts(data.data);
      } catch (error) {
        console.error("Failed to load poll results", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showResults || loading) return;
    const timer = setTimeout(() => setVisible(false), HIDE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [showResults, loading]);

  const submitResponse = async (answer: "yes" | "no") => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: POLL_ID, answer }),
      });
      const data = (await res.json()) as ApiResponse<PollCounts>;

      if (!data.success || !data.data) {
        throw new Error(data.error || "Unable to record vote");
      }

      setCounts(data.data);
      setShowResults(true);
    } catch (error) {
      console.error("Poll submit error", error);
      setErrorMsg("Couldn't record your vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const total = counts.totalCount;
  const yesPercent = total ? Math.round((counts.yesCount / total) * 100) : 0;
  const noPercent = total ? 100 - yesPercent : 0;

  if (!visible) return null;

  return (
    <div className="card-base animate-slide-in pointer-events-auto relative grid w-full max-w-60 gap-2 rounded-2xl border-stone-600 bg-stone-800/90 p-2 text-left text-zinc-200 shadow-2xl sm:max-w-md sm:gap-3 sm:p-3">
      <button
        type="button"
        aria-label="Close poll"
        onClick={() => setVisible(false)}
        className="absolute top-1 right-1 rounded-full px-2 py-1 text-lg font-bold text-white transition-colors hover:text-white"
      >
        ×
      </button>
      <div className="grid gap-1">
        <p className="mb-1 text-center text-sm font-semibold tracking-wide text-amber-700 sm:text-xs">
          Quick pulse
        </p>
        <h3 className="text-sm leading-tight font-bold sm:text-base md:text-lg">
          Do you think AI knows it&apos;s artificial?
        </h3>
      </div>

      <div className="grid auto-cols-fr grid-flow-col gap-2">
        <button
          type="button"
          disabled={submitting || showResults}
          onClick={() => submitResponse("yes")}
          className="rounded-2xl bg-amber-700 px-3 py-2 text-center text-xs font-bold text-stone-900 shadow-xl transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
        >
          Yes
        </button>
        <button
          type="button"
          disabled={submitting || showResults}
          onClick={() => submitResponse("no")}
          className="rounded-2xl border border-stone-600 bg-stone-900 px-3 py-2 text-center text-xs font-bold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:border-amber-700 focus-visible:outline focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
        >
          No
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm font-semibold text-red-300">{errorMsg}</p>
      )}

      {showResults ? (
        <div className="grid gap-2 rounded-2xl bg-stone-900/80 p-2 sm:gap-3">
          <ResultRow
            label="Yes"
            percent={loading ? null : yesPercent}
            count={counts.yesCount}
            barColor="bg-amber-700"
          />
          <ResultRow
            label="No"
            percent={loading ? null : noPercent}
            count={counts.noCount}
            barColor="bg-stone-300"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-stone-600 bg-stone-900/50 p-2 text-xs text-zinc-200">
          Vote to see the general consensus.
        </div>
      )}
    </div>
  );
}

function ResultRow({
  label,
  percent,
  count,
  barColor,
}: {
  label: string;
  percent: number | null;
  count: number;
  barColor: string;
}) {
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-sm font-semibold text-zinc-200">
        <span>{label}</span>
        <span>
          {percent === null ? "…" : `${Math.max(0, Math.min(100, percent))}%`}{" "}
          <span className="text-xs font-normal text-stone-400">
            ({count.toLocaleString()})
          </span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-800">
        <div
          className={`h-full rounded-full ${barColor} transition-[width] duration-500 ease-out motion-reduce:transition-none`}
          style={{ width: `${percent ?? 0}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
