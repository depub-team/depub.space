import { useContext } from 'react';
import { AlertContext } from './AlertContext';

export const useAlert = () => {
  const ctx = useContext(AlertContext);

  return ctx;
};
