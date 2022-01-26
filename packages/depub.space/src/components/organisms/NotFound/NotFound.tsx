import { Center, Text, Heading, VStack, View } from 'native-base';
import React, { FC } from 'react';
import { LogoIconText } from '@depub/theme';

export const NotFound: FC = () => (
  <View alignItems="center" flex={1} justifyContent="center" pt={8}>
    <VStack space={8}>
      <LogoIconText height="180px" width="180px" />
      <Center>
        <Heading color="black" fontSize="6xl">
          404
        </Heading>
        <Text>Page Not Found</Text>
      </Center>
    </VStack>
  </View>
);
