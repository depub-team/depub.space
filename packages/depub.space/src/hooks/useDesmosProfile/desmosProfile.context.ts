import { DesmosProfile } from '@desmoslabs/sdk-core';
import { createContext } from 'react';

export interface DesmosProfileContextProps {
  cachedProfiles?: Record<string, DesmosProfile | null>;
  setCachedProfiles?: React.Dispatch<React.SetStateAction<Record<string, DesmosProfile | null>>>;
}

export const DesmosProfileContext = createContext<DesmosProfileContextProps>({});
