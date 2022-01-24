import React, { ComponentProps, FC } from 'react';
import { View } from 'native-base';
import { Meta, MetaProps } from '../../atoms';
import { Navbar } from '../../molecules';

export interface LayoutProps extends ComponentProps<typeof View> {
  walletAddress?: string;
  metadata?: MetaProps;
}

export const Layout: FC<LayoutProps> = ({ children, metadata, walletAddress, ...props }) => (
  <View {...props}>
    <Meta {...metadata} />
    <Navbar walletAddress={walletAddress} />

    {children}
  </View>
);
