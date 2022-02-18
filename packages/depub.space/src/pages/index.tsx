import React, { memo, useEffect, useState } from 'react';
import Debug from 'debug';
import { Divider, useToast, VStack } from 'native-base';
import { DesmosProfile, Message } from '../interfaces';
import { AppStateError, useAppState, useSigningCosmWasmClient } from '../hooks';
import {
  Layout,
  MessageList,
  MessageComposer,
  MessageFormType,
  ConnectWallet,
} from '../components';
import { MAX_WIDTH } from '../contants';
import { dataUrlToFile } from '../utils';

const debug = Debug('web:<IndexPage />');

export default function IndexPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const {
    error: connectError,
    isLoading: isConnectLoading,
    connectKeplr,
    connectWalletConnect,
    walletAddress,
    offlineSigner,
  } = useSigningCosmWasmClient();
  const { isLoading, fetchMessages, fetchMessagesByOwner, postMessage, fetchUser } = useAppState();
  const toast = useToast();

  const fetchNewMessages = async (previousId?: string, refresh?: boolean) => {
    debug('fetchNewMessages()');

    if (isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    const newMessages = await fetchMessages(previousId, refresh);

    if (newMessages) {
      if (!refresh) {
        setMessages(msgs => msgs.concat(newMessages));
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

      const [account] = await offlineSigner.getAccounts();

      const txn = await postMessage(offlineSigner, data.message, file && [file]);

      await Promise.all([
        fetchNewMessages(undefined, true),
        fetchMessagesByOwner(account.address, undefined, true), // trigger clear cache in async without blocking the thread
      ]);

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
  );
}
