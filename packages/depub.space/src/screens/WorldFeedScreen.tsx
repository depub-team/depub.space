import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import update from 'immutability-helper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { useWindowDimensions } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Message } from '../interfaces';
import { useAppState, useWallet } from '../hooks';
import { MessageList, MessageFormType, useAlert, MessageComposer } from '../components/molecules';
import {
  waitAsync,
  dataUrlToFile,
  postMessage,
  getLikecoinAddressByProfile,
  getMessages,
} from '../utils';
import { Layout } from '../components/templates';
import type { MainStackParamList, RootStackParamList } from '../navigation';
import { NAV_HEADER_HEIGHT } from '../constants';
import { ListHeaderContainer } from '../components';

const debug = Debug('web:<WorldFeedScreen />');
const stickyHeaderIndices = [0];
const emptyMessages: Message[] = [];
const layoutMetadata = {
  title: 'World Feed',
};

export type WorldFeedScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'WorldFeed'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const WorldFeedScreen: FC<WorldFeedScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>(emptyMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const dimension = useWindowDimensions();
  const { isLoading: isConnectLoading, walletAddress, offlineSigner } = useWallet();
  const { profile, showLoading, closeLoading } = useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const userHandle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const alert = useAlert();

  const fetchNewMessages = useCallback(
    async (previousId?: string, refresh?: boolean) => {
      debug('fetchNewMessages(previousId: %s, refresh: %O)', previousId, refresh);

      if (isLoading || isListReachedEnd) {
        debug('fetchNewMessages() -> early return');

        return;
      }

      setIsLoading(true);

      try {
        const { data: newMessages, hasMore } = await getMessages(previousId);

        if (!hasMore) {
          setIsListReachedEnd(true);
        }

        if (newMessages) {
          if (!refresh) {
            setMessages(msg => update(msg, { $push: newMessages }));
          } else {
            setMessages(msg => update(msg, { $set: newMessages }));
          }
        }
      } catch (ex) {
        alert.show({
          title: 'Failed to get data, please try again later.',
          status: 'error',
        });
      }

      setIsLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isListReachedEnd, isLoading, messages]
  );

  const handleOnSubmit = useCallback(
    async (data: MessageFormType, image?: string | null) => {
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
      showLoading();

      try {
        const txn = await postMessage(offlineSigner, data.message, file && [file]);

        closeLoading();

        await waitAsync(100); // wait a bit

        if (txn) {
          alert.show({
            title: 'Post created successfully!',
            status: 'success',
          });
        }

        await waitAsync(500); // wait a bit

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        navigation.navigate('User', { account: userHandle! });
      } catch (ex) {
        debug('postMessage() -> error: %O', ex);
        let errorMessage = 'Failed to post message! please try again later.';

        if (/^Account does not exist on chain/.test(ex.message)) {
          errorMessage = ex.message;
        } else if (ex.message === 'Request rejected') {
          errorMessage = ex.message;
        }

        closeLoading();

        alert.show({
          title: errorMessage,
          status: 'error',
        });

        Sentry.captureException(ex);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offlineSigner, userHandle]
  );

  const renderListHeaderComponent = useMemo(
    () =>
      isLoggedIn ? (
        <ListHeaderContainer>
          <MessageComposer
            isLoading={isLoading}
            profile={profile}
            walletAddress={walletAddress}
            onSubmit={handleOnSubmit}
          />
        </ListHeaderContainer>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, isLoggedIn, profile, walletAddress]
  );

  useEffect(() => {
    // reset
    setIsListReachedEnd(false);
    setMessages(emptyMessages);

    void (async () => {
      await fetchNewMessages(undefined, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout metadata={layoutMetadata}>
      <MessageList
        data={messages}
        h={dimension.height - NAV_HEADER_HEIGHT}
        isLoading={isLoading}
        ListHeaderComponent={renderListHeaderComponent}
        scrollEventThrottle={100}
        stickyHeaderIndices={isLoggedIn ? stickyHeaderIndices : undefined} // sticky message composer if logged in
        onFetchData={fetchNewMessages}
      />
    </Layout>
  );
};
