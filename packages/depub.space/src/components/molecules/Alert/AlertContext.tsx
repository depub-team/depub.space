import { createContext } from 'react';
import { AlertProps } from './Alert';

export interface AlertContextProps {
  alert: AlertProps | null;
  show: (alert: AlertProps) => void;
}

export const AlertContext = createContext<AlertContextProps>({
  alert: null,
  show: null as never,
});
