import { BlurView } from 'expo-blur';
import { useColorMode } from 'native-base';
import React, { FC } from 'react';

export const ListHeaderContainer: FC = ({ children }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <BlurView intensity={50} tint={isDarkMode ? 'dark' : 'light'}>
      {children}
    </BlurView>
  );
};
