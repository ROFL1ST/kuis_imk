import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names safely, resolving conflicts.
 * Usage: cn('px-2 py-1', isActive && 'bg-brand-500', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
