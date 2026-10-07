import { useEffect } from 'react';

// Jab user kisi element (ref) ke bahar click kare, to onOutside() chalao.
// Dropdown menus band karne ke liye use hota hai.
export default function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutside();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, onOutside]);
}
