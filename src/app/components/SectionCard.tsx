import type { ReactNode } from "react";
import { cn } from "@/app/lib/cn";

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
  const sectionClassName = cn(
    "section-card",
    variant === "spaced" && "mb-4",
    className,
  );
  const headingClassName = cn("section-title", titleClassName);

  return (
    <section aria-labelledby={id} className={sectionClassName}>
      <h2 id={id} className={headingClassName}>
        {title}
      </h2>
      {children}
    </section>
  );
}
