import type { ReactNode } from "react";

type SectionCardProps = {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  variant?: "default" | "spaced";
};

export default function SectionCard({
  id,
  title,
  children,
  className,
  titleClassName,
  variant = "default",
}: SectionCardProps) {
  const sectionClassName = [
    "section-card",
    variant === "spaced" ? "section-card-spaced" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const headingClassName = ["section-title", titleClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section aria-labelledby={id} className={sectionClassName}>
      <h2 id={id} className={headingClassName}>
        {title}
      </h2>
      {children}
    </section>
  );
}
