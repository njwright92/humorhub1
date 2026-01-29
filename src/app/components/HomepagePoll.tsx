"use client";

import { useEffect, useState } from "react";

type PollCounts = {
  yesCount: number;
  noCount: number;
  totalCount: number;
};

const POLL_ID = "homepage_v2";
const HIDE_AFTER_MS = 3000;

const EMPTY_COUNTS: PollCounts = { yesCount: 0, noCount: 0, totalCount: 0 };

export default function HomepagePoll() {
  const [counts, setCounts] = useState<PollCounts>(EMPTY_COUNTS);
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
        const data = (await res.json()) as {
          success: boolean;
          data?: PollCounts;
        };
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

  const handleClose = () => setVisible(false);

  const submitResponse = async (answer: "yes" | "no") => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: POLL_ID, answer }),
      });
      const data = (await res.json()) as {
        success: boolean;
        data?: PollCounts;
        error?: string;
      };

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

  const total = counts.totalCount || 0;
  const yesPercent = total ? Math.round((counts.yesCount / total) * 100) : 0;
  const noPercent = total ? 100 - yesPercent : 0;

  if (!visible) return null;

  return (
    <div className="card-base animate-slide-in pointer-events-auto relative grid w-full max-w-md gap-3 border-stone-700 bg-stone-950/90 p-4 text-left text-zinc-200 shadow-2xl">
      <button
        type="button"
        aria-label="Close poll"
        onClick={handleClose}
        className="absolute top-2 right-2 rounded-full px-2 py-1 text-lg font-bold text-zinc-200 transition-colors hover:bg-black/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        ×
      </button>
      <div className="grid gap-1">
        <p className="mb-1 text-center text-xs font-semibold tracking-wide text-amber-700">
          Quick pulse
        </p>
        <h3 className="text-base leading-tight font-bold md:text-lg">
          Do you think AI knows it's artificial?
        </h3>
      </div>

      <div className="grid auto-cols-fr grid-flow-col gap-2">
        <button
          type="button"
          disabled={submitting || showResults}
          onClick={() => submitResponse("yes")}
          className="rounded-2xl bg-amber-700 px-4 py-2 text-center text-sm font-bold text-stone-900 shadow-xl transition-all duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Yes
        </button>
        <button
          type="button"
          disabled={submitting || showResults}
          onClick={() => submitResponse("no")}
          className="rounded-2xl border border-stone-600 bg-stone-900 px-4 py-2 text-center text-sm font-bold text-zinc-200 shadow-xl transition-all duration-200 hover:scale-[1.02] hover:border-amber-700 focus-visible:outline focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          No
        </button>
      </div>

      {errorMsg && (
        <p className="text-sm font-semibold text-red-300">{errorMsg}</p>
      )}

      {showResults ? (
        <div className="grid gap-3 rounded-2xl bg-stone-900/80 p-3">
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
        <div className="rounded-2xl border border-dashed border-stone-700 bg-stone-900/50 p-3 text-xs text-stone-200">
          Vote to see how everyone else answered.
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
  const width = percent === null ? "0%" : `${percent}%`;
  const displayPercent =
    percent === null ? "…" : `${Math.max(0, Math.min(100, percent))}%`;

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-sm font-semibold text-zinc-200">
        <span>{label}</span>
        <span>
          {displayPercent}{" "}
          <span className="text-xs font-normal text-stone-400">
            ({count.toLocaleString()})
          </span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-800">
        <div
          className={`h-full rounded-full ${barColor} transition-[width] duration-500 ease-out motion-reduce:transition-none`}
          style={{ width }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
