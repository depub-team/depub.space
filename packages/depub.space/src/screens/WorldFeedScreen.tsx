import React, { FC, useState, useCallback } from 'react';
import update from 'immutability-helper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { VStack } from 'native-base';
import { useWindowDimensions } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Message } from '../interfaces';
import { AppStateError, useAppState, useWallet } from '../hooks';
import { MessageList, MessageFormType, useAlert, MessageComposer } from '../components/molecules';
import { waitAsync, dataUrlToFile, getLikecoinAddressByProfile } from '../utils';
import { Layout } from '../components/templates';
import type { MainStackParamList, RootStackParamList } from '../navigation';
import { NAV_HEADER_HEIGHT } from '../constants';

const debug = Debug('web:<WorldFeedScreen />');
const stickyHeaderIndices = [0];

export type WorldFeedScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'WorldFeed'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const WorldFeedScreen: FC<WorldFeedScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const dimension = useWindowDimensions();
  const { isLoading: isConnectLoading, walletAddress, offlineSigner } = useWallet();
  const { profile, isLoading, fetchMessages, postMessage } = useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const userHandle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const alert = useAlert();

  const fetchNewMessages = async (previousId?: string, refresh?: boolean) => {
    debug('fetchNewMessages(previousId: %s, refresh: %O)', previousId, refresh);

    if (isLoadingMore || isListReachedEnd) {
      return;
    }

    setIsLoadingMore(true);

    const { data: newMessages, hasMore } = await fetchMessages(previousId);

    if (!hasMore) {
      setIsListReachedEnd(true);
    }

    if (newMessages) {
      if (!refresh) {
        setMessages(update(messages, { $push: newMessages }));
      } else {
        setMessages(update(messages, { $set: newMessages }));
      }
    }

    setIsLoadingMore(false);
  };

  const handleOnSubmit = async (data: MessageFormType, image?: string | null) => {
    try {
      let file: File | undefined;

      if (image) {
        file = await dataUrlToFile(image, 'upload');
      }

      if (!offlineSigner) {
        alert.show({
          title: 'No valid signer, please connect wallet',
          status: 'error',
        });

        return;
      }

      // show loading
      navigation.navigate('Loading');

      const txn = await postMessage(offlineSigner, data.message, file && [file]);

      await waitAsync(500); // wait a bit

      setIsListReachedEnd(false); // reset

      window.location.href = `/user/${userHandle}`;

      if (txn) {
        alert.show({
          title: 'Post created successfully!',
          status: 'success',
        });
      }
    } catch (ex: any) {
      alert.show({
        title:
          ex instanceof AppStateError ? ex.message : 'Something went wrong, please try again later',
        status: 'error',
      });
    }
  };

  const renderListHeaderComponent = () =>
    isLoggedIn ? (
      <VStack
        _dark={{
          bg: 'darkBlue.900',
          shadow: 'dark',
        }}
        _light={{ bg: 'white', shadow: 'light' }}
        mb={4}
        space={4}
        w="100%"
      >
        <MessageComposer
          isLoading={isLoading}
          profile={profile}
          walletAddress={walletAddress}
          onSubmit={handleOnSubmit}
        />
      </VStack>
    ) : null;

  useFocusEffect(
    useCallback(() => {
      // reset
      setIsListReachedEnd(false);

      void (async () => {
        await fetchNewMessages(undefined, true);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Layout
      metadata={{
        title: 'World Feed',
      }}
    >
      <MessageList
        data={messages}
        h={dimension.height - NAV_HEADER_HEIGHT}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        ListHeaderComponent={renderListHeaderComponent}
        scrollEventThrottle={100}
        stickyHeaderIndices={isLoggedIn ? stickyHeaderIndices : undefined} // sticky message composer if logged in
        onFetchData={fetchNewMessages}
      />
    </Layout>
  );
};
