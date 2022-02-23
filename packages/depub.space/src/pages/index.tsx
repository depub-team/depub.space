import React, { memo, useEffect, useState } from 'react';
import Debug from 'debug';
import { Divider, useToast, VStack } from 'native-base';
import { useRouter } from 'next/router';
import { DesmosProfile, Message } from '../interfaces';
import { AppStateError, useAppState, useSigningCosmWasmClient } from '../hooks';
import {
  Layout,
  MessageList,
  MessageComposer,
  MessageFormType,
  ConnectWallet,
  MessageModal,
} from '../components';
import { MAX_WIDTH } from '../contants';
import { waitAsync, dataUrlToFile } from '../utils';

const debug = Debug('web:<IndexPage />');
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;
const isDev = process.env.NODE_ENV !== 'production';

export default function IndexPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const router = useRouter();
  const rewriteRouteObject =
    typeof window !== 'undefined' ? ((window as any) || {}).rewriteRoute || {} : {};
  const iscnId = isDev ? router.query.id?.toString() : rewriteRouteObject.account; // rewriteRoute object is injecting by Cloudflare worker
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const {
    error: connectError,
    isLoading: isConnectLoading,
    connectKeplr,
    connectWalletConnect,
    walletAddress,
    offlineSigner,
  } = useSigningCosmWasmClient();
  const { isLoading, fetchMessage, fetchMessages, postMessage, fetchUser } = useAppState();
  const toast = useToast();

  const handleOnCloseModal = async () => {
    setSelectedMessage(null);

    await router.push('/', undefined, { shallow: true });
  };

  const fetchNewMessages = async (previousId?: string, refresh?: boolean) => {
    debug('fetchNewMessages()');

    if (isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    const newMessages = await fetchMessages(previousId);

    if (newMessages) {
      if (!refresh) {
        setMessages(msgs => Array.from(new Set(msgs.concat(newMessages))));
      } else {
        setMessages(newMessages);
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
        toast.show({
          title: 'No valid signer, please connect wallet',
          status: 'error',
          placement: 'top',
        });

        return;
      }

      const txn = await postMessage(offlineSigner, data.message, file && [file]);

      await waitAsync(500); // wait a bit

      await fetchNewMessages(undefined, true); // then get new message

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
    if (iscnId) {
      void (async () => {
        debug('iscnId: %s', iscnId);

        const message = await fetchMessage(`${ISCN_SCHEME}/${iscnId}`);

        setSelectedMessage(message);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iscnId]);

  useEffect(() => {
    debug('useEffect()');

    void fetchNewMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        status: 'error',
        placement: 'top',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

  const ListHeaderComponent = memo(() => (
    <VStack maxW={MAX_WIDTH} mb={8} mx="auto" px={4} w="100%">
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

      <Divider />
    </VStack>
  ));

  const ListItemSeparatorComponent = memo(() => (
    <Divider maxW={MAX_WIDTH} mx="auto" my={4} w="100%" />
  ));

  return (
    <>
      <Layout>
        <MessageList
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          ItemSeparatorComponent={ListItemSeparatorComponent}
          ListHeaderComponent={ListHeaderComponent}
          messages={messages}
          onFetchMessages={fetchNewMessages}
        />
      </Layout>

      {selectedMessage && (
        <MessageModal isOpen message={selectedMessage} onClose={handleOnCloseModal} />
      )}
    </>
  );
}
