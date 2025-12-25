'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onClick?: () => void;
}

// Default blur data URL for placeholder
const defaultBlurDataURL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=';

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  quality = 85,
  placeholder = 'blur',
  blurDataURL = defaultBlurDataURL,
  objectFit = 'cover',
  onClick,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle invalid or missing src
  const isValidSrc = src && src.trim() !== '' && !error;

  // Fallback component when image fails to load
  if (!isValidSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        onClick={onClick}
      >
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  // Determine if it's an external URL or internal
  const isExternal = src.startsWith('http://') || src.startsWith('https://');
  
  // Default sizes for responsive images
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`} onClick={onClick}>
      {loading && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`}
          style={{ zIndex: 1 }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ objectFit }}
        priority={priority}
        sizes={defaultSizes}
        quality={quality}
        placeholder={isExternal ? 'empty' : placeholder}
        blurDataURL={isExternal ? undefined : blurDataURL}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        unoptimized={isExternal} // Skip optimization for external URLs if needed
      />
    </div>
  );
}

// Product-specific image component with preset sizes
interface ProductImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}

const productSizes = {
  sm: { width: 80, height: 80, sizes: '80px' },
  md: { width: 200, height: 200, sizes: '200px' },
  lg: { width: 300, height: 300, sizes: '(max-width: 640px) 100vw, 300px' },
  xl: { width: 500, height: 500, sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px' },
};

export function ProductImage({
  src,
  alt,
  size = 'md',
  className = '',
  priority = false,
  onClick,
}: ProductImageProps) {
  const { width, height, sizes } = productSizes[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
      sizes={sizes}
      priority={priority}
      onClick={onClick}
    />
  );
}

// Avatar image component
interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallback?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  className = '',
  fallback,
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-primary text-white font-medium rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}

// Banner image component for hero sections
interface BannerImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function BannerImage({
  src,
  alt,
  className = '',
  priority = true,
}: BannerImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={className}
      priority={priority}
      sizes="100vw"
      quality={90}
    />
  );
}

// Category image component
interface CategoryImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function CategoryImage({
  src,
  alt,
  className = '',
}: CategoryImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={120}
      height={120}
      className={`rounded-full ${className}`}
      sizes="120px"
    />
  );
}
