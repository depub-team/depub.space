import { BlurView } from 'expo-blur';
import { useColorMode } from 'native-base';
import React, { FC, ReactNode } from 'react';

export interface NavigationThemeProviderProps {
  children?: ReactNode;
}

export const ListHeaderContainer: FC<NavigationThemeProviderProps> = ({ children }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <BlurView intensity={50} tint={isDarkMode ? 'dark' : 'light'}>
      {children}
    </BlurView>
  );
};
