import type { ReactNode } from "react";
import ProtectedRouteButton from "./ProtectedRouteButton";

export default function NewsButton({
  children = "Check It Out",
  className = "btn-primary w-72 justify-self-center text-lg md:w-80 md:justify-self-end",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ProtectedRouteButton route="/News" label="News" className={className}>
      {children}
    </ProtectedRouteButton>
  );
}
