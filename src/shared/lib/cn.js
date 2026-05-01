import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Usage: cn('px-2 py-1', condition && 'bg-red-500', 'px-4')
 * => 'py-1 bg-red-500 px-4'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
