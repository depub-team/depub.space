import React, { ComponentProps, FC } from 'react';
import { Box, View } from 'native-base';
import { Dimensions } from 'react-native';
import { Meta, MetaProps } from '../../atoms';
import { Navbar } from '../../molecules';

const NAVBAR_HEIGHT_DESKTOP = 74;
const NAVBAR_HEIGHT_MOBILE = 68;
const windowHeight = Dimensions.get('window').height;

export interface LayoutProps extends ComponentProps<typeof View> {
  metadata?: MetaProps;
  hideNavbar?: boolean;
}

export const Layout: FC<LayoutProps> = ({ children, hideNavbar, metadata, ...props }) => (
  <View {...props}>
    <Meta {...metadata} />
    {!hideNavbar ? <Navbar /> : null}

    <Box
      flex={{
        base: `1 0 ${windowHeight - NAVBAR_HEIGHT_MOBILE}px`,
        md: `1 0 ${windowHeight - NAVBAR_HEIGHT_DESKTOP}px`,
      }}
    >
      {children}
    </Box>
  </View>
);
