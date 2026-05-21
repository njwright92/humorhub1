import Link from "next/link";

const links = [
  { h: "/mic-finder", t: "Mic Finder" },
  { h: "/News", t: "News" },
  { h: "/about", t: "About" },
  { h: "/contact", t: "Contact" },
];

export default function NotFound() {
  const btnCls =
    "rounded-lg bg-amber-700 px-4 py-3 transition-colors hover:bg-amber-600";

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="mb-4 text-6xl font-bold text-amber-700 md:text-8xl">
          404
        </h1>
        <h2 className="mb-4 text-2xl md:text-3xl">Page Not Found</h2>
        <p className="mb-8 text-stone-400">
          Looks like this page doesn't exist. Let's get you back on track!
        </p>

        <div className="mb-8 grid grid-cols-2 gap-4">
          {links.map((l) => (
            <Link key={l.h} href={l.h} className={btnCls}>
              {l.t}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-block rounded-lg bg-stone-700 px-6 py-4 text-lg font-black transition-colors hover:bg-stone-600"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
