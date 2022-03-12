import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import update from 'immutability-helper';
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
import { AppStateError, useAppState, useWallet } from '../hooks';
import type { RootStackParamList, MainStackParamList } from '../navigation';
import { NAV_HEADER_HEIGHT } from '../constants';
import { assertRouteParams, dataUrlToFile, getLikecoinAddressByProfile, waitAsync } from '../utils';

const debug = Debug('web:<ChannelScreen />');

const stickyHeaderIndices = [0];
const emptyMessages: Message[] = [];

export type ChannelScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'Channel'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ChannelScreen: FC<ChannelScreenProps> = assertRouteParams(({ navigation, route }) => {
  const name = decodeURIComponent(route.params.name);
  const [messages, setMessages] = useState<Message[]>(emptyMessages);
  const [channelName, setChannelName] = useState<string | null>(null);
  const dimension = useWindowDimensions();
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const { isLoading: isConnectLoading, walletAddress, offlineSigner } = useWallet();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { profile, postMessage, isLoading, fetchMessagesByHashTag, showLoading, closeLoading } =
    useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const userHandle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const alert = useAlert();
  const layoutMetadata = useMemo(() => ({ title: `#${name}` || undefined }), [name]);

  const fetchNewMessages = async (previousId?: string, refresh?: boolean) => {
    debug(
      'fetchNewMessages(previousId: %s, refresh: %O, name: %s, isListReachedEnd: %O, isLoadingMore: %O)',
      previousId,
      refresh,
      name,
      isListReachedEnd,
      isLoadingMore
    );

    if (isLoadingMore || isListReachedEnd) {
      return;
    }

    setIsLoadingMore(true);

    const { data: newMessages, hasMore } = await fetchMessagesByHashTag(name, previousId);

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
      showLoading();

      const txn = await postMessage(offlineSigner, data.message, file && [file]);

      await waitAsync(500); // wait a bit

      if (txn) {
        alert.show({
          title: 'Post created successfully!',
          status: 'success',
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      navigation.navigate('User', { account: userHandle! });
    } catch (ex: any) {
      alert.show({
        title:
          ex instanceof AppStateError ? ex.message : 'Something went wrong, please try again later',
        status: 'error',
      });
    }

    closeLoading();
  };

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
  }, [channelName, setIsListReachedEnd]);

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
    <Layout metadata={layoutMetadata}>
      <MessageList
        data={messages}
        h={dimension.height - NAV_HEADER_HEIGHT}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        ListHeaderComponent={renderListHeader}
        scrollEventThrottle={100}
        stickyHeaderIndices={stickyHeaderIndices}
        onFetchData={fetchNewMessages}
      />
    </Layout>
  );
});

// (ChannelScreen as any).whyDidYouRender = true;
