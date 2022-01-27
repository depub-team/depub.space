import React, { ComponentProps, FC } from 'react';
import { Box, View } from 'native-base';
import { Dimensions } from 'react-native';
import { Meta, MetaProps } from '../../atoms';
import { Navbar } from '../../molecules';

const NAVBAR_HEIGHT = 74;
const windowHeight = Dimensions.get('window').height;

export interface LayoutProps extends ComponentProps<typeof View> {
  metadata?: MetaProps;
  hideNavbar?: boolean;
}

export const Layout: FC<LayoutProps> = ({ children, hideNavbar, metadata, ...props }) => (
  <View {...props}>
    <Meta {...metadata} />
    {!hideNavbar ? <Navbar /> : null}

    <Box flex={`1 0 ${windowHeight - NAVBAR_HEIGHT}px`}>{children}</Box>
  </View>
);
