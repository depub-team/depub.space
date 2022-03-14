import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Debug from 'debug';
import { Alert, AlertProps } from './Alert';
import { AlertContext, AlertContextProps } from './AlertContext';

const debug = Debug('web:<AlertProvider />');

export const AlertProvider: FC = ({ children }) => {
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const show = useCallback((a: AlertProps) => {
    debug('show(alert: %O)', a);

    setAlert({
      ...a,
      onClose: () => setAlert(null),
    });
  }, []);

  const value = useMemo<AlertContextProps>(
    () => ({
      show,
      alert,
    }),
    [show, alert]
  );

  useEffect(() => {
    debug('useEffect()');

    if (!alert) {
      return () => {};
    }

    const timeout = setTimeout(() => {
      debug('useEffect() -> setTimeout()');

      setAlert(null);
    }, 6000); // 6sec

    return () => clearTimeout(timeout);
  }, [alert]);

  return (
    <AlertContext.Provider value={value}>
      {children}

      {alert && <Alert {...alert} />}
    </AlertContext.Provider>
  );
};
