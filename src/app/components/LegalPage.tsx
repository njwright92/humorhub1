import Link from "next/link";

type LegalSection = {
  title: string;
  content: string;
  list?: string[];
};

export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="page-shell gap-8">
      <h1 className="page-title text-center">{title}</h1>
      <section className="panel-light">
        <p className="border-b border-stone-400 pb-4 text-xs font-bold uppercase opacity-60">
          Last Updated: {updated}
        </p>

        <div className="grid gap-8 pt-4 text-left">
          {sections.map((s) => (
            <article key={s.title} className="grid gap-2">
              <h2 className="text-2xl text-amber-700">{s.title}</h2>
              <p>{s.content}</p>
              {s.list && (
                <ul className="grid list-inside list-disc gap-1 pl-4 opacity-80">
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}

          <article className="grid gap-2">
            <h2 className="text-2xl text-amber-700">5. Contact</h2>
            <p>
              Questions?{" "}
              <Link
                href="/contact"
                className="font-bold text-blue-700 underline"
              >
                Contact Us
              </Link>
            </p>
          </article>

          <div className="flex justify-center border-t border-stone-400 pt-8">
            <Link href="/" className="btn-primary">
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
