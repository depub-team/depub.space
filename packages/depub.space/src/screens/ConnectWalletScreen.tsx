import { DrawerScreenProps } from '@react-navigation/drawer';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import React, { FC, useCallback } from 'react';
import { ConnectWalletModal } from '../components';
import { useWallet } from '../hooks';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';

const debug = Debug('web:<ConnectWalletScreen />');

export type ConnectWalletScreenProps = CompositeScreenProps<
  DrawerScreenProps<RootStackParamList, 'ConnectWallet'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const ConnectWalletScreen: FC<ConnectWalletScreenProps> = ({ navigation }) => {
  const { connectKeplr, connectWalletConnect, walletAddress } = useWallet();

  const handleOnClose = () => {
    debug('handleOnClose()');

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (walletAddress) {
        handleOnClose();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress])
  );

  return (
    <ConnectWalletModal
      isOpen
      onClose={handleOnClose}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onPressKeplr={connectKeplr}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onPressWalletConnect={connectWalletConnect}
    />
  );
};
