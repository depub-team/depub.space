import { Text, Icon, Modal, VStack, IModalProps, Link } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import React, { FC } from 'react';

export type NoBalanceModalProps = IModalProps;

export const NoBalanceModal: FC<NoBalanceModalProps> = props => (
  <Modal {...props}>
    <Modal.Content maxW={480} w="100%">
      <Modal.CloseButton />
      <Modal.Body flex={1} px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <VStack alignItems="center" flex={1} justifyContent="center" space={4} textAlign="center">
          <Icon as={MaterialIcons} color="primary.500" name="money-off" size="xl" />
          <Text>
            Your account has no balance, you can go to{' '}
            <Link href="https://faucet.like.co/" isExternal>
              Likecoin faucet
            </Link>{' '}
            to get 2.5 LIKE to start posting your first tweet.
          </Text>
        </VStack>
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
