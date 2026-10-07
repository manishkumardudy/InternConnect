import { useEffect, useState } from 'react';

// value ko 'delay' ms ruk kar return karta hai.
// Search box me har akshar par API call na ho, isliye use karte hain.
export default function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
