import { DesmosProfile } from '@desmoslabs/sdk-core';
import React, { FC, useState } from 'react';
import { DesmosProfileContext } from './desmosProfile.context';

export const DesmosProfileProvider: FC = ({ children }) => {
  const [cachedProfiles, setCachedProfiles] = useState<Record<string, DesmosProfile | null>>({});

  return (
    <DesmosProfileContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        cachedProfiles,
        setCachedProfiles,
      }}
    >
      {children}
    </DesmosProfileContext.Provider>
  );
};
