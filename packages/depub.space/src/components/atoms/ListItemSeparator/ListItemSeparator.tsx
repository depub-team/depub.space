import React from 'react';

import { Divider } from 'native-base';

export const ListItemSeparator = () => (
  <Divider
    _dark={{
      bg: 'gray.800',
    }}
    _light={{
      bg: 'gray.200',
    }}
    my={4}
    w="100%"
  />
);
