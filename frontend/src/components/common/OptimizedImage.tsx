'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder'> {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

// Generates a base64 grey shimmer SVG to be used as a premium loading placeholder
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f3f4f6" offset="20%" />
      <stop stop-color="#e5e7eb" offset="50%" />
      <stop stop-color="#f3f4f6" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f3f4f6" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite" />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  ...props
}: OptimizedImageProps) {
  // Check if image is external or local relative url to load safely
  const isSvg = src.endsWith('.svg');
  const blurUrl = `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      placeholder={isSvg ? undefined : 'blur'}
      blurDataURL={isSvg ? undefined : blurUrl}
      loading="lazy"
      {...props}
    />
  );
}
