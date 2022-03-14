import React, { ComponentProps, FC } from 'react';
import { View } from 'native-base';
import { Meta, MetaProps } from '../../atoms';

export interface LayoutProps extends ComponentProps<typeof View> {
  metadata?: MetaProps;
}

export const Layout: FC<LayoutProps> = ({ children, metadata, ...props }) => (
  <>
    <Meta {...metadata} />
    <View flex={1} {...props}>
      {children}
    </View>
  </>
);
