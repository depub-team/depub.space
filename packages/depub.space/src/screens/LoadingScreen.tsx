import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, Spinner, Modal, VStack } from 'native-base';
import React, { FC } from 'react';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';

export type LoadingScreenProps = CompositeScreenProps<
  DrawerScreenProps<RootStackParamList, 'Loading'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const LoadingScreen: FC<LoadingScreenProps> = () => (
  <Modal isOpen>
    <Modal.Content h={220} w={220}>
      <Modal.Body h={220} p={0} w={220}>
        <VStack alignItems="center" flex={1} justifyContent="center" space={4}>
          <Spinner accessibilityLabel="Loading messages" size="lg" />
          <Text>Loading...</Text>
        </VStack>
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
