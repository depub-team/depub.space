import React, { FC, useCallback, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { Link as NBLink, Box, VStack, Text, Heading, Avatar, Stack } from 'native-base';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Layout, MessageList } from '../components';
import { Message, DesmosProfile } from '../interfaces';
import { useAppState, useWallet } from '../hooks';
import { getAbbrNickname, getLikecoinAddressByProfile } from '../utils';
import { getShortenAddress } from '../utils/getShortenAddress';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';

const debug = Debug('web:<UserScreen />');
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;
const SCROLL_THRESHOLD = 150;

export type UserScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'User'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const UserScreen: FC<UserScreenProps> = ({ route, navigation }) => {
  const [isReady, setIsReady] = useState(false);
  const { account } = route.params;
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isHeaderHide, setIsHeaderHide] = useState(false);
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const shortenAccount = account ? getShortenAddress(account) : '';
  const [messages, setMessages] = useState<Message[]>([]);
  const { walletAddress } = useWallet();
  const { isLoading, fetchMessagesByOwner } = useAppState();
  const profilePic = useMemo(
    () => (profile?.profilePic ? { uri: profile?.profilePic } : undefined),
    [profile]
  );
  const nickname = profile?.nickname || shortenAccount;
  const abbrNickname = getAbbrNickname(nickname);
  const isWalletAddress = /^(cosmos1|like1)/.test(account);
  const bio = profile?.bio;
  const dtag = profile?.dtag;
  const likecoinWalletAddress = profile && getLikecoinAddressByProfile(profile);

  // only show messages when the account has linked to Likecoin
  const showMessagesList = isWalletAddress || likecoinWalletAddress || !isReady;

  const fetchNewMessages = useCallback(
    async (previousId?: string, refresh?: boolean) => {
      debug('fetchNewMessages()');

      if (!account) {
        return;
      }

      if (isLoadingMore || isListReachedEnd) {
        return;
      }

      setIsLoadingMore(true);

      const res = await fetchMessagesByOwner(account, previousId);

      if (res) {
        const newMessages = res.messages;

        if (newMessages) {
          if (newMessages.length === 0) {
            setIsListReachedEnd(true);
          }

          if (!refresh) {
            setMessages(msgs => Array.from(new Set(msgs.concat(newMessages))));
          } else {
            setMessages(newMessages);
          }
        }

        if (res.profile) {
          setProfile(res.profile);
        }

        setIsReady(true);
      }

      setIsLoadingMore(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [account]
  );

  const handleOnScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;

      if (offsetY > SCROLL_THRESHOLD) {
        setIsHeaderHide(true);
      } else if (offsetY === 0) {
        setIsHeaderHide(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOnPress = useCallback((message: Message) => {
    const messageIscnId = message.id.replace(new RegExp(`^${ISCN_SCHEME}/`), '');

    navigation.navigate('Post', { id: messageIscnId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnImagePress = useCallback((image: string, aspectRatio?: number) => {
    debug('handleOnImagePress(image: %s, aspectRatio: %d)', aspectRatio);

    navigation.navigate('Image', { image, aspectRatio });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ListHeaderComponent = useMemo(
    () => (
      <Stack
        _dark={{
          bg: 'darkBlue.900',
          shadow: 'dark',
        }}
        _light={{ bg: 'white', shadow: 'light' }}
        alignItems="center"
        flex={1}
        flexDirection={isHeaderHide ? 'row' : 'column'}
        justifyContent="center"
        mb={8}
        px={4}
        py={isHeaderHide ? 4 : 8}
        space={4}
      >
        <Avatar mr={isHeaderHide ? 4 : 0} size={isHeaderHide ? 'md' : 'lg'} source={profilePic}>
          {abbrNickname}
        </Avatar>
        <VStack alignItems={isHeaderHide ? 'flex-start' : 'center'} space={1}>
          <Box textAlign={isHeaderHide ? 'left' : 'center'}>
            <Heading fontSize="xl">{nickname}</Heading>
            {dtag ? (
              <Text color="gray.400" fontSize="sm">
                @{dtag}
              </Text>
            ) : null}
          </Box>
          {!isHeaderHide && bio ? <Text fontSize="sm">{bio}</Text> : null}
        </VStack>
      </Stack>
    ),
    [abbrNickname, bio, dtag, isHeaderHide, nickname, profilePic]
  );

  useFocusEffect(
    useCallback(() => {
      // reset
      setIsReady(false);
      setProfile(null);
      setMessages([]);
      setIsListReachedEnd(false);

      void (async () => {
        await fetchNewMessages(undefined, true);
      })();
    }, [fetchNewMessages])
  );

  return account ? (
    <Layout metadata={{ title: `${nickname || walletAddress} on depub.SPACE` }}>
      {showMessagesList ? (
        <MessageList
          data={messages}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          ListHeaderComponent={ListHeaderComponent}
          stickyHeaderIndices={[0]}
          onFetchData={fetchNewMessages}
          onImagePress={handleOnImagePress}
          onPress={handleOnPress}
          onScroll={handleOnScroll}
        />
      ) : (
        <VStack space={4}>
          {ListHeaderComponent}
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
};
