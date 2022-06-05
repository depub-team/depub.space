import Debug from 'debug';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { Layout, MessageModal, useAlert } from '../components';
import { Message } from '../interfaces';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { getMessageById, getShortenAddress } from '../utils';

const debug = Debug('web:<PostScreen />');
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;

export type PostScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Post'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const PostScreen: FC<PostScreenProps> = ({ route, navigation }) => {
  const [message, setMessage] = useState<Message | null>(null);
  const alert = useAlert();
  const id = decodeURIComponent(route.params.id);
  const revision = decodeURIComponent(route.params.revision);
  const iscnId = `${ISCN_SCHEME}/${id}/${revision}`;
  const messageBody = message?.message;
  const excerpt =
    `${messageBody?.slice(0, 30)}${(messageBody?.length || 0) > 30 ? '...' : ''}` || '';
  const profile = message?.profile;
  const from = message?.from;
  const shortenAddress = from && getShortenAddress(`${from.slice(0, 10)}...${from.slice(-4)}`);
  const displayName = profile?.nickname || profile?.dtag || shortenAddress;
  const metadata = useMemo(
    () => ({
      title: `${displayName}: ${excerpt}`,
    }),
    [excerpt, displayName]
  );

  const handleOnClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    debug('useEffect() -> iscnId: %s', iscnId);

    void (async () => {
      try {
        const newMessage = await getMessageById(iscnId);

        if (newMessage) {
          setMessage(newMessage);
        } else {
          navigation.replace('NotFound');
        }
      } catch (ex) {
        alert.show({
          title: 'Failed to get data, please try again later.',
          status: 'error',
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iscnId]);

  return (
    message && (
      <Layout metadata={metadata}>
        <MessageModal isOpen message={message} onClose={handleOnClose} />
      </Layout>
    )
  );
};
