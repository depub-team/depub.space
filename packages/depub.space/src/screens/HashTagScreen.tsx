import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import update from 'immutability-helper';
import * as Sentry from '@sentry/nextjs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useWindowDimensions } from 'react-native';
import {
  Layout,
  ListHeaderContainer,
  MessageComposer,
  MessageFormType,
  MessageList,
  useAlert,
} from '../components';
import { Message } from '../interfaces';
import { useAppState, useWallet } from '../hooks';
import type { RootStackParamList, MainStackParamList } from '../navigation';
import { NAV_HEADER_HEIGHT } from '../constants';
import {
  assertRouteParams,
  dataUrlToFile,
  getLikecoinAddressByProfile,
  getMessagesByHashTag,
  postMessage,
  waitAsync,
} from '../utils';

const debug = Debug('web:<HashTagScreen />');

const stickyHeaderIndices = [0];
const emptyMessages: Message[] = [];

export type HashTagScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'HashTag'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HashTagScreen: FC<HashTagScreenProps> = assertRouteParams(({ navigation, route }) => {
  const name = decodeURIComponent(route.params.name);
  const [messages, setMessages] = useState<Message[]>(emptyMessages);
  const [channelName, setChannelName] = useState<string | null>(null);
  const dimension = useWindowDimensions();
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const { isLoading: isConnectLoading, walletAddress, offlineSigner } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const { profile, showLoading, closeLoading } = useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const userHandle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const alert = useAlert();
  const metadata = useMemo(() => ({ title: `#${name}` || undefined }), [name]);

  const fetchNewMessages = useCallback(
    async (previousId?: string, refresh?: boolean) => {
      debug('fetchNewMessages(previousId: %s, refresh: %O', previousId, refresh);

      if (isLoading || isListReachedEnd) {
        debug('fetchNewMessages() -> early return');

        return;
      }

      setIsLoading(true);

      try {
        const { data: newMessages, hasMore } = await getMessagesByHashTag(name, previousId);

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
    [isListReachedEnd, isLoading, name]
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

  const renderListHeader = useMemo(
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
    void (async () => {
      await fetchNewMessages(undefined, true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  useFocusEffect(
    useCallback(() => {
      debug('useFocusEffect() -> name: %s', name);

      // reset
      if (channelName !== name) {
        navigation.setOptions({
          title: `#${name}`,
        });

        setIsListReachedEnd(false);
        setMessages(emptyMessages);
        setChannelName(name);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, channelName])
  );

  return (
    <Layout metadata={metadata}>
      <MessageList
        data={messages}
        h={dimension.height - NAV_HEADER_HEIGHT}
        isLoading={isLoading}
        ListHeaderComponent={renderListHeader}
        stickyHeaderIndices={isLoggedIn ? stickyHeaderIndices : undefined} // sticky message composer if logged in
        onFetchData={fetchNewMessages}
      />
    </Layout>
  );
});
