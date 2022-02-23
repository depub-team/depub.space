import React, { memo, useEffect, useState } from 'react';
import Debug from 'debug';
import { Link, Box, IconButton, HStack, useToast, Divider, VStack, Heading } from 'native-base';
import { Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'next/router';
import {
  ConnectWallet,
  Layout,
  MessageComposer,
  MessageFormType,
  MessageList,
  MessageModal,
} from '../../components';
import { DesmosProfile, Message } from '../../interfaces';
import { AppStateError, useAppState, useSigningCosmWasmClient } from '../../hooks';
import { MAX_WIDTH } from '../../contants';
import { dataUrlToFile, waitAsync } from '../../utils';

const debug = Debug('web:<UserPage />');
const isDev = process.env.NODE_ENV !== 'production';
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;

export default function IndexPage() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const rewriteRouteObject =
    typeof window !== 'undefined' ? ((window as any) || {}).rewriteRoute || {} : {};
  const tagName = isDev ? router.query.name?.toString() : rewriteRouteObject.name; // rewriteRoute object is injecting by Cloudflare worker
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const {
    error: connectError,
    isLoading: isConnectLoading,
    connectKeplr,
    connectWalletConnect,
    walletAddress,
    offlineSigner,
  } = useSigningCosmWasmClient();
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const { isLoading, postMessage, fetchMessagesByTag, fetchUser } = useAppState();
  const toast = useToast();

  const fetchNewMessages = async (previousId?: string, refresh?: boolean) => {
    if (!tagName) {
      return;
    }

    if (isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    const newMessages = await fetchMessagesByTag(tagName, previousId);

    if (newMessages) {
      if (!refresh) {
        setMessages(msgs => Array.from(new Set(msgs.concat(newMessages))));
      } else {
        setMessages(newMessages);
      }
    }

    setIsLoadingMore(false);
  };

  const handleOnShare = async (message: Message) => {
    const messageIscnId = message.id.replace(new RegExp(`^${ISCN_SCHEME}/`), '');
    const shareableUrl = isDev ? `/?id=${messageIscnId}` : `/${messageIscnId}`;

    await router.push(`/tags?name=${tagName}`, shareableUrl, { shallow: true });

    setSelectedMessage(message);
  };

  const handleOnCloseModal = async () => {
    const currentUrl = isDev ? `/tags?name=${tagName}` : `/${tagName}`;

    setSelectedMessage(null);

    await router.push(`/tags?name=${tagName}`, currentUrl, { shallow: true });
  };

  const handleOnSubmit = async (data: MessageFormType, image?: string | null) => {
    try {
      let file: File | undefined;

      if (image) {
        file = await dataUrlToFile(image, 'upload');
      }

      if (!offlineSigner) {
        toast.show({
          title: 'No valid signer, please connect wallet',
          status: 'error',
          placement: 'top',
        });

        return;
      }

      const txn = await postMessage(offlineSigner, data.message, file && [file]);

      await waitAsync(500); // wait a bit

      await fetchNewMessages(undefined, true);

      if (txn) {
        toast.show({
          title: 'Post created successfully!',
          status: 'success',
          placement: 'top',
        });
      }
    } catch (ex: any) {
      toast.show({
        title:
          ex instanceof AppStateError ? ex.message : 'Something went wrong, please try again later',
        status: 'error',
        placement: 'top',
      });
    }
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
    // eslint-disable-next-line func-names
    void (async function () {
      if (walletAddress) {
        const user = await fetchUser(walletAddress);

        if (user && user.profile) {
          setProfile(user.profile);
        }
      }
    })();
  }, [walletAddress, fetchUser]);

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
    <VStack maxW={MAX_WIDTH} mb={8} mx="auto" pt={4} px={4} w="100%">
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
          <Heading fontSize="2xl">#{tagName}</Heading>
        </VStack>

        <Box w="48px" />
      </HStack>

      <Box mb={8}>
        {walletAddress && !isConnectLoading ? (
          <MessageComposer
            address={walletAddress}
            isLoading={isLoading || isConnectLoading}
            profile={profile}
            onSubmit={handleOnSubmit}
          />
        ) : (
          <ConnectWallet
            isLoading={isLoading || isConnectLoading}
            onPressKeplr={connectKeplr}
            onPressWalletConnect={connectWalletConnect}
          />
        )}
      </Box>

      <Divider mb={8} />
    </VStack>
  ));

  const ListItemSeparatorComponent = memo(() => (
    <Divider maxW={MAX_WIDTH} mx="auto" my={4} w="100%" />
  ));

  return tagName ? (
    <>
      <Layout metadata={{ title: walletAddress || undefined }}>
        <MessageList
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          ItemSeparatorComponent={ListItemSeparatorComponent}
          ListHeaderComponent={ListHeaderComponent}
          messages={messages}
          onFetchMessages={fetchNewMessages}
          onShare={handleOnShare}
        />
      </Layout>

      {selectedMessage && (
        <MessageModal isOpen message={selectedMessage} onClose={handleOnCloseModal} />
      )}
    </>
  ) : null;
}
