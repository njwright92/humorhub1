import Link from "next/link";

export default function AuthGatePrompt({ message }: { message: string }) {
  return (
    <section className="card-base mx-auto mt-10 max-w-md border-stone-700 bg-stone-800 p-8 text-center shadow-xl">
      <span className="text-6xl" aria-hidden="true">
        🔐
      </span>
      <h2 className="mt-4 text-2xl text-amber-700">Sign In Required</h2>
      <p className="mb-6 text-stone-400">{message}</p>
      <Link href="/mic-finder" className="btn-primary inline-block px-6 py-3">
        Go to MicFinder
      </Link>
    </section>
  );
}
