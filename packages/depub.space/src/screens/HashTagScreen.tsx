import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import update from 'immutability-helper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useWindowDimensions } from 'react-native';
import { Layout, ListHeaderContainer, MessageComposer, MessageList, useAlert } from '../components';
import { Message } from '../interfaces';
import { useAppState } from '../hooks/useAppState.hook';
import type { RootStackParamList, MainStackParamList } from '../navigation';
import { NAV_HEADER_HEIGHT } from '../constants';
import { assertRouteParams, getMessagesByHashTag } from '../utils';
import { useWallet } from '../hooks/useWallet.hook';

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
  const { isLoading: isConnectLoading, walletAddress } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const { profile, showMessageComposerModal } = useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
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

  const handleComposerFocus = useCallback(() => {
    showMessageComposerModal();
  }, [showMessageComposerModal]);

  const renderListHeader = useMemo(
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
