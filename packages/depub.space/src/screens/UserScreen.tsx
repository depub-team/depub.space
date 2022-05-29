import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import update from 'immutability-helper';
import Debug from 'debug';
import { Link as NBLink, Box, VStack, Text } from 'native-base';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Layout, ListHeaderContainer, MessageList, useAlert, UserHeader } from '../components';
import { Message, UserProfile } from '../interfaces';
import { useAppState, useWallet } from '../hooks';
import { checkIsNFTProfilePicture, getMessagesByOwner } from '../utils';
import { getShortenAddress } from '../utils/getShortenAddress';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { assertRouteParams } from '../utils/assertRouteParams';

const debug = Debug('web:<UserScreen />');
const SCROLL_THRESHOLD = 150;

// hoisted props
const stickyHeaderIndices = [0];
const emptyMessages: Message[] = [];

export type UserScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'User'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const UserScreen: FC<UserScreenProps> = assertRouteParams(({ route, navigation }) => {
  const { account } = route.params;
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeaderHide, setIsHeaderHide] = useState(false);
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const { showProfilePictureModal } = useAppState();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const shortenAccount = account ? getShortenAddress(account) : '';
  const [messages, setMessages] = useState<Message[]>(emptyMessages);
  const alert = useAlert();
  const { walletAddress, isLoading: isConnectLoading } = useWallet();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
  const isEditable = walletAddress === profile?.address;
  const profilePic = useMemo(
    () => (profile?.profilePic ? { uri: profile.profilePic } : undefined),
    [profile]
  );
  const nickname = profile?.nickname || shortenAccount;
  const isWalletAddress = /^(cosmos1|like1)/.test(account);
  const bio = profile?.bio;
  const dtag = profile?.dtag;
  const likecoinWalletAddress = profile?.address;
  const metadata = useMemo(
    () => ({ title: `${nickname || walletAddress} on depub.space` }),
    [nickname, walletAddress]
  );

  // only show messages when the account has linked to Likecoin
  const showMessagesList = isWalletAddress || likecoinWalletAddress || !isReady;

  const fetchNewMessages = useCallback(
    async (previousId?: string, refresh?: boolean) => {
      debug('fetchNewMessages(previousId: %s, refresh: %O', previousId, refresh);

      if (!account || isLoading || isListReachedEnd) {
        debug('fetchNewMessages() -> early return');

        return;
      }

      setIsLoading(true);

      try {
        const res = await getMessagesByOwner(account, previousId);

        if (res) {
          const newMessages = res.data?.messages || [];

          if (!res.hasMore) {
            setIsListReachedEnd(true);
          }

          if (newMessages) {
            if (!refresh) {
              setMessages(msgs => update(msgs, { $push: newMessages }));

              if (res.data?.profile) {
                setProfile({
                  ...res.data.profile,
                  isNFTProfilePicture: checkIsNFTProfilePicture(
                    res.data.profile.profilePicProvider || ''
                  ),
                });
              }
            } else {
              setMessages(msgs => update(msgs, { $set: newMessages }));
            }
          }
        }
      } catch (ex) {
        alert.show({
          title: 'Failed to get data, please try again later.',
          status: 'error',
        });
      }

      setIsReady(true);
      setIsLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account, isListReachedEnd, isLoading]
  );

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
        editable={isEditable}
        isNFTProfilePicture={profile?.isNFTProfilePicture}
        nickname={nickname}
        profilePic={profilePic}
        onEditProfilePicture={showProfilePictureModal}
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
        title: nickname,
      });

      setIsReady(false);
      setMessages(emptyMessages);
      setIsListReachedEnd(false);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account])
  );

  return account ? (
    <Layout metadata={metadata}>
      {showMessagesList ? (
        <MessageList
          data={messages}
          isLoading={isLoading}
          ListHeaderComponent={renderListHeader}
          stickyHeaderIndices={isLoggedIn ? stickyHeaderIndices : undefined} // sticky message composer if logged in
          onFetchData={fetchNewMessages}
          onScroll={handleOnScroll}
        />
      ) : (
        <VStack space={4}>
          <UserHeader
            bio={bio}
            collapse={isHeaderHide}
            dtag={dtag}
            editable={isEditable}
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
