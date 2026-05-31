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
  return (
    <section
      aria-labelledby={id}
      className={cn("section-card", variant === "spaced" && "mb-4", className)}
    >
      <h2 id={id} className={cn("section-title", titleClassName)}>
        {title}
      </h2>
      {children}
    </section>
  );
}
