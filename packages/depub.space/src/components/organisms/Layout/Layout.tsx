import React, { ComponentProps, FC } from 'react';
import { View } from 'native-base';
import { Meta, MetaProps } from '../../atoms';
import { Navbar } from '../../molecules';

export interface LayoutProps extends ComponentProps<typeof View> {
  walletAddress?: string;
  metadata?: MetaProps;
  hideNavbar?: boolean;
}

export const Layout: FC<LayoutProps> = ({
  children,
  hideNavbar,
  metadata,
  walletAddress,
  ...props
}) => (
  <View {...props}>
    <Meta {...metadata} />
    {!hideNavbar ? <Navbar walletAddress={walletAddress} /> : null}

    {children}
  </View>
);
