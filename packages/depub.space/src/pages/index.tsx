import React, { memo, useEffect, useState } from 'react';
import Debug from 'debug';
import { Divider, useToast, VStack } from 'native-base';
import { Message } from '../interfaces';
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
  const {
    error: connectError,
    isLoading: isConnectLoading,
    connectKeplr,
    connectWalletConnect,
    walletAddress,
    offlineSigner,
    profile,
  } = useSigningCosmWasmClient();
  const { isLoading, fetchMessages, postMessage } = useAppState();
  const toast = useToast();

  const fetchNewMessages = async () => {
    debug('fetchNewMessages()');

    const res = await fetchMessages();

    if (res) {
      setMessages(res.messages);
    }
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

      await fetchNewMessages();

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
        ItemSeparatorComponent={ListItemSeparatorComponent}
        ListHeaderComponent={ListHeaderComponent}
        messages={messages}
        onFetchMessages={fetchNewMessages}
      />
    </Layout>
  );
}
