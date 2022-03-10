import { Text, Center } from 'native-base';
import React, { FC } from 'react';

export const ListEmpty: FC = () => (
  <Center my={8}>
    <Text color="gray.400">No Message</Text>
  </Center>
);
