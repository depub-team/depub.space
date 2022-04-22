import React, { FC, useState, useMemo, useCallback } from 'react';
import update from 'immutability-helper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { useWindowDimensions } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Message } from '../interfaces';
import { useAppState, useWallet } from '../hooks';
import { MessageList, useAlert, MessageComposer } from '../components/molecules';
import { getMessages } from '../utils';
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

export const WorldFeedScreen: FC<WorldFeedScreenProps> = () => {
  const [messages, setMessages] = useState<Message[]>(emptyMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const dimension = useWindowDimensions();
  const { isLoading: isConnectLoading, walletAddress } = useWallet();
  const { profile, showMessageComposerModal } = useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
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
    [isListReachedEnd, isLoading]
  );

  const handleComposerFocus = useCallback(() => {
    showMessageComposerModal();
  }, [showMessageComposerModal]);

  const renderListHeaderComponent = useMemo(
    () =>
      isLoggedIn ? (
        <ListHeaderContainer>
          <MessageComposer
            isCollapsed
            isLoading={isLoading}
            profile={profile}
            walletAddress={walletAddress}
            onFocus={handleComposerFocus}
          />
        </ListHeaderContainer>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, isLoggedIn, profile, walletAddress]
  );

  useFocusEffect(
    useCallback(() => {
      // reset
      setIsListReachedEnd(false);
      setMessages(emptyMessages);

      void (async () => {
        await fetchNewMessages(undefined, true);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

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
