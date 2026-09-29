/* eslint-disable @next/next/no-img-element */
import { getImageProps } from "next/image";
import type { ImgHTMLAttributes } from "react";
/** Local content only; preserves the gallery's intentional aspect-ratio layout. */
export function ResponsivePhoto({
  src,
  alt = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw",
  ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
  if (typeof src !== "string" || !src.startsWith("/"))
    return <img {...rest} src={src} alt={alt} />;
  const { props } = getImageProps({
    src,
    alt,
    width: 1600,
    height: 1000,
    sizes,
    quality: 75,
  });
  return (
    <img
      {...rest}
      src={props.src}
      srcSet={props.srcSet}
      sizes={sizes}
      alt={alt}
      decoding="async"
    />
  );
}
