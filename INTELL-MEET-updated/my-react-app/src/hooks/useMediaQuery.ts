import { useState, useEffect } from 'react';

/**
 * useMediaQuery
 * Returns true if the current viewport matches the given CSS media query string.
 * Automatically updates on window resize.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
const useMediaQuery = (query: string): boolean => {
  const getMatch = () =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    // Use addEventListener if available (modern browsers), fallback to addListener
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
    } else {
      mql.addListener(onChange); // Safari < 14
    }

    setMatches(mql.matches); // sync on mount

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', onChange);
      } else {
        mql.removeListener(onChange);
      }
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
