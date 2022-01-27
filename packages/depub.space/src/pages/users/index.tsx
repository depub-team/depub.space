import React, { memo, useEffect, useState } from 'react';
import Debug from 'debug';
import {
  Link,
  Box,
  IconButton,
  HStack,
  useToast,
  Divider,
  VStack,
  Text,
  Heading,
  FlatList,
  Avatar,
} from 'native-base';
import { Platform, RefreshControl } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { MessageCard, Layout } from '../../components';
import { Message } from '../../interfaces';
import { useAppState, useSigningCosmWasmClient } from '../../hooks';
import { DesmosProfile, fetchDesmosProfile, getAbbrNickname } from '../../utils';
import { getShortenAddress } from '../../utils/getShortenAddress';
import { MAX_WIDTH, END_REACHED_THRESHOLD, ROWS_PER_PAGE } from '../../contants';

const debug = Debug('web:<UserPage />');

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function IndexPage() {
  const urlParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const account = urlParams.get('account');
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const shortenAccount = account ? getShortenAddress(account) : '';
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [offset, setOffset] = useState(ROWS_PER_PAGE);
  const [messagesWithPaging, setMessagesWithPaging] = useState(messages.slice(0, ROWS_PER_PAGE));
  const { error: connectError, walletAddress } = useSigningCosmWasmClient();
  const { isLoading, fetchMessagesByOwner } = useAppState();
  const toast = useToast();
  const profilePic = profile?.profilePic;
  const nickname = profile?.nickname || shortenAccount;
  const abbrNickname = getAbbrNickname(nickname);
  const bio = profile?.bio;
  const dtag = profile?.dtag;
  const dummyItems = Array.from(new Array(12)).map<Message>(() => ({
    id: `id-${uid()}`,
    message: '',
    rawMessage: '',
    from: '',
    date: new Date(),
  }));

  const fetchNewMessages = async () => {
    if (!account) {
      return;
    }

    const res = await fetchMessagesByOwner(account);

    if (res) {
      setMessages(res.messages);
    }
  };

  const handleOnEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    debug(
      'handleOnEndReached() -> distanceFromEnd: %d, offset: %d, ROWS_PER_PAGE: %d, messages.length: %d',
      distanceFromEnd,
      offset,
      ROWS_PER_PAGE,
      messages.length
    );

    if (distanceFromEnd < 0) {
      return;
    }

    const newOffset = Math.min(offset + ROWS_PER_PAGE, messages.length);

    setMessagesWithPaging(messages.slice(0, newOffset));
    setOffset(newOffset);
  };

  const handleOnRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchNewMessages();
    } catch (ex) {
      debug('handleOnRefresh() -> error: %O', ex);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      if (!account) {
        if (Platform.OS === 'web') {
          window.location.href = '/';
        }

        return;
      }

      const res = await fetchMessagesByOwner(account);
      const desmosProfile = await fetchDesmosProfile(account);

      if (desmosProfile) {
        setProfile(desmosProfile);
      }

      if (res) {
        setMessages(res.messages);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMessagesByOwner, account]);

  useEffect(() => {
    if (connectError) {
      toast.show({
        title: connectError,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

  // get first batch of messages
  useEffect(() => {
    setMessagesWithPaging(messages.slice(0, ROWS_PER_PAGE));
  }, [messages]);

  const ListHeaderComponent = memo(() => (
    <VStack h="100%" maxW="640px" mx="auto" my={4} px={4} space={8} w="100%">
      <HStack alignItems="center" flex={1} justifyContent="center" space={2}>
        <Link href="/">
          <IconButton
            _icon={{
              as: AntDesign,
              name: 'back',
            }}
          />
        </Link>
        <HStack flex={1} justifyContent="center" space={3}>
          <Avatar bg="gray.200" size="md" source={profilePic ? { uri: profilePic } : undefined}>
            {abbrNickname}
          </Avatar>
          <VStack alignItems="center" justifyContent="center" space={1}>
            <Heading fontSize="xl">{nickname}</Heading>
            {dtag ? (
              <Text color="gray.500" fontSize="sm">
                @{dtag}
              </Text>
            ) : null}
            {bio ? <Text fontSize="sm">{bio}</Text> : null}
          </VStack>
        </HStack>

        <Box w="48px" />
      </HStack>

      <Divider mb={8} />
    </VStack>
  ));

  const ListItemSeparatorComponent = memo(() => (
    <Divider maxW={MAX_WIDTH} mx="auto" my={4} w="100%" />
  ));

  return account ? (
    <Layout metadata={{ title: walletAddress }}>
      <FlatList<Message>
        data={refreshing || isLoading ? dummyItems : messagesWithPaging}
        ItemSeparatorComponent={ListItemSeparatorComponent}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />}
        renderItem={ctx => (
          <MessageCard isLoading={isLoading} maxW={MAX_WIDTH} message={ctx.item} mx="auto" />
        )}
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
      />
    </Layout>
  ) : null;
}
