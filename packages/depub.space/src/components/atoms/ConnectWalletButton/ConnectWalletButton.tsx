import React, { FC } from 'react';
import { Entypo } from '@expo/vector-icons';
import { Button, IButtonProps, Icon } from 'native-base';

export const ConnectWalletButton: FC<IButtonProps> = props => (
  <Button
    id="connect-wallet-button"
    leftIcon={<Icon as={Entypo} name="wallet" size="sm" />}
    {...props}
  >
    Connect Wallet
  </Button>
);
