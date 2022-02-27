import React, { ComponentProps, FC, useState } from 'react';
import { Entypo } from '@expo/vector-icons';
import { Text, Button, Icon, Image, VStack, Modal, Heading } from 'native-base';

interface ConnectModalProps extends ComponentProps<typeof Modal> {
  onPressWalletConnect?: () => void;
  onPressKeplr?: () => void;
}
interface ConnectButtonProps extends ComponentProps<typeof Button> {
  icon: string;
  title: string;
  description: string;
}
const ConnectButton: FC<ConnectButtonProps> = ({ icon, title, description, ...props }) => (
  <Button
    _dark={{
      _hover: { bg: 'gray.800', borderColor: 'gray.300' },
    }}
    _light={{
      _hover: { bg: 'gray.100', borderColor: 'gray.200' },
    }}
    _stack={{
      alignItems: 'center',
      space: 3,
      direction: 'row',
      w: '100%',
    }}
    borderColor="gray.200"
    borderWidth={1}
    rounded="lg"
    startIcon={<Image alt="start icon" h={12} source={{ uri: icon }} w={12} />}
    variant="unstyled"
    {...props}
  >
    <Heading _dark={{ color: 'white' }} _light={{ color: 'black' }} mb={0} size="md">
      {title}
    </Heading>
    <Text color="gray.500" fontSize="sm">
      {description}
    </Text>
  </Button>
);

export const ConnectModal: FC<ConnectModalProps> = ({
  onPressWalletConnect,
  onPressKeplr,
  ...props
}) => (
  <Modal {...props}>
    <Modal.Content maxWidth="400px">
      <Modal.CloseButton />
      <Modal.Header>Connect Wallet</Modal.Header>
      <Modal.Body p={4}>
        <VStack space={4}>
          <ConnectButton
            description=" Keplr Browser Extension"
            icon="/images/keplr-icon.svg"
            title="Keplr Wallet"
            onPress={onPressKeplr}
          />

          <ConnectButton
            description=" Liker Land APP"
            icon="/images/walletconnect-icon.svg"
            title="WalletConnect"
            onPress={onPressWalletConnect}
          />
        </VStack>
      </Modal.Body>
    </Modal.Content>
  </Modal>
);

interface ConnectWalletProps {
  onPressWalletConnect?: () => void;
  onPressKeplr?: () => void;
  isLoading?: boolean;
}
export const ConnectWallet: FC<ConnectWalletProps> = ({
  onPressKeplr,
  onPressWalletConnect,
  isLoading,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <VStack alignItems="center" flex={1} justifyContent="center" py={8} space={4}>
        <Button
          isLoading={isLoading}
          leftIcon={<Icon as={Entypo} name="wallet" size="sm" />}
          onPress={() => setShowModal(true)}
        >
          Connect Wallet
        </Button>
      </VStack>
      <ConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPressKeplr={onPressKeplr}
        onPressWalletConnect={onPressWalletConnect}
      />
    </>
  );
};
