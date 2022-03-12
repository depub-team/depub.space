import React from 'react';

import { Divider } from 'native-base';

const style = {
  _dark: {
    bg: 'gray.800',
  },
  _light: {
    bg: 'gray.200',
  },
  w: '100%',
};

export const ListItemSeparator = () => <Divider {...style} />;
