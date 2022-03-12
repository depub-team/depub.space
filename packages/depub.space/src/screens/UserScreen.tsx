import React, { FC, useCallback, useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import update from 'immutability-helper';
import Debug from 'debug';
import { Link as NBLink, Box, VStack, Text } from 'native-base';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Layout, ListHeaderContainer, MessageList, UserHeader } from '../components';
import { Message, DesmosProfile } from '../interfaces';
import { useAppState, useWallet } from '../hooks';
import { getLikecoinAddressByProfile } from '../utils';
import { getShortenAddress } from '../utils/getShortenAddress';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { assertRouteParams } from '../utils/assertRouteParams';

const debug = Debug('web:<UserScreen />');
const SCROLL_THRESHOLD = 150;
const stickyHeaderIndices = [0];
const emptyMessages: Message[] = [];

export type UserScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'User'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const UserScreen: FC<UserScreenProps> = assertRouteParams(({ route, navigation }) => {
  const { account } = route.params;
  const [isReady, setIsReady] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHeaderHide, setIsHeaderHide] = useState(false);
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const shortenAccount = account ? getShortenAddress(account) : '';
  const [messages, setMessages] = useState<Message[]>(emptyMessages);
  const { walletAddress } = useWallet();
  const { isLoading, fetchMessagesByOwner } = useAppState();
  const profilePic = profile?.profilePic;
  const nickname = profile?.nickname || shortenAccount;
  const isWalletAddress = /^(cosmos1|like1)/.test(account);
  const bio = profile?.bio;
  const dtag = profile?.dtag;
  const likecoinWalletAddress = profile && getLikecoinAddressByProfile(profile);

  // only show messages when the account has linked to Likecoin
  const showMessagesList = isWalletAddress || likecoinWalletAddress || !isReady;

  const fetchNewMessages = async (previousId?: string, refresh?: boolean) => {
    debug('fetchNewMessages()');

    if (!account || isLoadingMore || isListReachedEnd) {
      debug('fetchNewMessages() -> early return');

      return;
    }

    setIsLoadingMore(true);

    const res = await fetchMessagesByOwner(account, previousId);

    if (res) {
      const newMessages = res.data?.messages || [];

      if (!res.hasMore) {
        setIsListReachedEnd(true);
      }

      if (newMessages) {
        if (!refresh) {
          setMessages(msgs => update(msgs, { $push: newMessages }));
        } else {
          if (res.data?.profile) {
            setProfile(res.data.profile);
          }

          setMessages(msgs => update(msgs, { $set: newMessages }));
        }
      }

      setIsReady(true);
    }

    setIsLoadingMore(false);
  };

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY > SCROLL_THRESHOLD) {
      setIsHeaderHide(true);
    } else if (offsetY === 0) {
      setIsHeaderHide(false);
    }
  };

  const renderListHeader = () => (
    <ListHeaderContainer>
      <UserHeader
        bio={bio}
        collapse={isHeaderHide}
        dtag={dtag}
        nickname={nickname}
        profilePic={profilePic}
      />
    </ListHeaderContainer>
  );

  useEffect(() => {
    if (!isReady) {
      void (async () => {
        await fetchNewMessages(undefined, true);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  useFocusEffect(
    useCallback(() => {
      // reset
      navigation.setOptions({
        title: account,
      });

      setIsReady(false);
      setProfile(null);
      setMessages(emptyMessages);
      setIsListReachedEnd(false);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account])
  );

  return account ? (
    <Layout metadata={{ title: `${nickname || walletAddress} on depub.SPACE` }}>
      {showMessagesList ? (
        <MessageList
          data={messages}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          ListHeaderComponent={renderListHeader}
          stickyHeaderIndices={stickyHeaderIndices}
          onFetchData={fetchNewMessages}
          onScroll={handleOnScroll}
        />
      ) : (
        <VStack space={4}>
          <UserHeader
            bio={bio}
            collapse={isHeaderHide}
            dtag={dtag}
            nickname={nickname}
            profilePic={profilePic}
          />

          <Box px={4}>
            <Text color="gray.400" textAlign="center">
              This profile has not linked to Likecoin, if you are the profile owner, please go to{' '}
              <NBLink href="https://x.forbole.com/" isExternal>
                Forbole X
              </NBLink>{' '}
              to link your Likecoin wallet address
            </Text>
          </Box>
        </VStack>
      )}
    </Layout>
  ) : null;
});

// (UserScreen as any).whyDidYouRender = true;
