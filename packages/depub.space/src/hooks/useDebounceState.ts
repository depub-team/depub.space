import { useCallback, useEffect, useRef, useState } from 'react';

export const useDebounceState = <T>(initialValue: T, delay: number): [T, (val: T) => void] => {
  const [value, setValue] = useState(initialValue);
  const timeout = useRef(0);

  const setDebounceValue = useCallback(
    (val: T) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      timeout.current = setTimeout(() => {
        setValue(val);
      }, delay) as unknown as number;
    },
    [delay]
  );

  useEffect(() => {
    setDebounceValue(initialValue);

    return () => clearTimeout(timeout.current);
  }, [initialValue, setDebounceValue]);

  return [value, setDebounceValue];
};
