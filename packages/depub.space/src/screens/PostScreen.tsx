import Debug from 'debug';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { FC, useEffect, useState } from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { Layout, MessageModal } from '../components';
import { useAppState } from '../hooks';
import { Message } from '../interfaces';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { getShortenAddress } from '../utils';

const debug = Debug('web:<PostScreen />');
const isDev = process.env.NODE_ENV !== 'production';

export type PostScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Post'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const PostScreen: FC<PostScreenProps> = ({ route, navigation }) => {
  const { fetchMessage } = useAppState();
  const [message, setMessage] = useState<Message | null>(null);
  const { id } = route.params;
  const iscnScheme = isDev ? 'iscn://likecoin-chain-testnet' : 'iscn://likecoin-chain';
  const iscnId = `${iscnScheme}/${id}`;
  const messageBody = message?.message;
  const abbrvMessage =
    `${messageBody?.slice(0, 30)}${messageBody?.length || 0 > 30 ? '...' : ''}` || '';
  const profile = message?.profile;
  const from = message?.from;
  const shortenAddress = from && getShortenAddress(`${from.slice(0, 10)}...${from.slice(-4)}`);
  const displayName = profile?.nickname || profile?.dtag || shortenAddress;

  const handleOnClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  useEffect(() => {
    debug('useEffect() -> iscnId: %s', iscnId);

    void (async () => {
      const newMessage = await fetchMessage(iscnId);

      if (newMessage) {
        setMessage(newMessage);
      } else {
        navigation.navigate('NotFound');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iscnId]);

  return (
    message && (
      <Layout
        metadata={{
          title: `${displayName}: ${abbrvMessage}`,
        }}
      >
        <MessageModal isOpen message={message} onClose={handleOnClose} />
      </Layout>
    )
  );
};
