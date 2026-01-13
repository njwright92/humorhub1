import Image from "next/image";

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
  const mergedClassName = [
    "round-image",
    interactive ? "round-image-interactive" : null,
    variant === "news" ? "round-image-news" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

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
