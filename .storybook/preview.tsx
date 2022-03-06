import { extendTheme, useColorMode, NativeBaseProvider } from 'native-base';
import { useDarkMode } from 'storybook-dark-mode';
import React, { FC, useEffect } from 'react';
import { theme } from '../packages/theme/src';
import { themes } from '@storybook/theming';

const config = {
  useSystemColorMode: false,
  initialColorMode: 'light',
};
const customTheme = extendTheme({ ...theme, config });

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on[A-Z].*' },
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark },
    // Override the default light theme
    light: { ...themes.normal },
  },
};

const StyledWrapper: FC = ({ children }) => {
  const { setColorMode } = useColorMode();
  const isDarkMode = useDarkMode();

  useEffect(() => {
    setColorMode(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return <>{children}</>;
};

export const decorators = [
  renderStory => (
    <NativeBaseProvider theme={customTheme}>
      <StyledWrapper>{renderStory()}</StyledWrapper>
    </NativeBaseProvider>
  ),
];
