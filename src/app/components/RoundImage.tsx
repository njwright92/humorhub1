import Image from "next/image";
import { cn } from "@/app/lib/cn";

type RoundImageProps = {
  src: string;
  alt: string;
  className?: string;
  interactive?: boolean;
  variant?: "default" | "news";
  width: number;
  height: number;
  sizes?: string;
  quality?: number;
  priority?: boolean;
};

export default function RoundImage({
  src,
  alt,
  className,
  interactive = false,
  variant = "default",
  width,
  height,
  sizes,
  quality,
  priority = false,
}: RoundImageProps) {
  const mergedClassName = cn(
    "round-image",
    interactive && "round-image-interactive",
    variant === "news" && "round-image-news",
    className,
  );

  return (
    <Image
      src={src}
      alt={alt}
      className={mergedClassName}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
    />
  );
}
