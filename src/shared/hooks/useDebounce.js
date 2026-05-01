import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the value.
 * @param {any} value
 * @param {number} delay - ms
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
