import React, { memo, useEffect, useState } from 'react';
import Debug from 'debug';
import { Link, Box, IconButton, HStack, useToast, Divider, VStack, Heading } from 'native-base';
import { Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'next/router';
import { Layout, MessageList } from '../../components';
import { Message } from '../../interfaces';
import { useAppState, useSigningCosmWasmClient } from '../../hooks';
import { MAX_WIDTH } from '../../contants';

const debug = Debug('web:<UserPage />');
const isDev = process.env.NODE_ENV !== 'production';

export default function IndexPage() {
  const router = useRouter();
  const rewriteRouteObject =
    typeof window !== 'undefined' ? ((window as any) || {}).rewriteRoute || {} : {};
  const tagName = isDev ? router.query.name?.toString() : rewriteRouteObject.name; // rewriteRoute object is injecting by Cloudflare worker
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { error: connectError, walletAddress } = useSigningCosmWasmClient();
  const { isLoading, fetchMessagesByTag } = useAppState();
  const toast = useToast();

  const fetchNewMessages = async (previousId?: string) => {
    if (!tagName) {
      return;
    }

    if (isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    const newMessages = await fetchMessagesByTag(tagName, previousId);

    if (newMessages) {
      setMessages(msgs => msgs.concat(newMessages));
    }

    setIsLoadingMore(false);
  };

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      if (!tagName && router.isReady) {
        if (Platform.OS === 'web') {
          window.location.href = '/';
        }

        return;
      }

      await fetchNewMessages();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagName, router.isReady]);

  useEffect(() => {
    if (connectError) {
      debug('useEffect() -> connectError: %s', connectError);

      toast.show({
        title: connectError,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

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
        <VStack alignItems="center" flex={1} justifyContent="center" space={4}>
          <Heading fontSize="xl">#{tagName}</Heading>
        </VStack>

        <Box w="48px" />
      </HStack>

      <Divider mb={8} />
    </VStack>
  ));

  const ListItemSeparatorComponent = memo(() => (
    <Divider maxW={MAX_WIDTH} mx="auto" my={4} w="100%" />
  ));

  return tagName ? (
    <Layout metadata={{ title: walletAddress || undefined }}>
      <MessageList
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        ItemSeparatorComponent={ListItemSeparatorComponent}
        ListHeaderComponent={ListHeaderComponent}
        messages={messages}
        onFetchMessages={fetchNewMessages}
      />
    </Layout>
  ) : null;
}
