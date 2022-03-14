import { Text, Spinner, Modal, VStack, IModalProps } from 'native-base';
import React, { FC } from 'react';

export type LoadingModalProps = IModalProps;

export const LoadingModal: FC<LoadingModalProps> = (props) => (
  <Modal {...props}>
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
