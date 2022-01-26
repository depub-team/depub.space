import React, { useEffect, useState } from 'react';
import {
  Link,
  Box,
  IconButton,
  HStack,
  useToast,
  Divider,
  VStack,
  Heading,
  FlatList,
  Avatar,
} from 'native-base';
import { Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { MessageRow, Layout } from '../../components';
import { Message } from '../../interfaces';
import { useAppState, useSigningCosmWasmClient } from '../../hooks';

export default function IndexPage() {
  const urlParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const account = urlParams.get('account');
  const shortenAccount = account ? `${account.slice(0, 10)}...${account.slice(-4)}` : '';
  const [messages, setMessages] = useState<Message[]>([]);
  const { error: connectError, walletAddress } = useSigningCosmWasmClient();
  const { isLoading, fetchMessagesByOwner } = useAppState();
  const toast = useToast();
  const dummyItems = Array.from(new Array(12)).map<Message>(() => ({
    id: `id-${Math.floor(Math.random() * 1000)}`,
    message: '',
    from: '',
    date: new Date(),
  }));

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

  return account ? (
    <Layout metadata={{ title: walletAddress }} walletAddress={walletAddress}>
      <VStack h="100%" maxWidth="480px" mx="auto" px={4} space={8} w="100%">
        <HStack alignItems="center" flex={1} justifyContent="center" space={2}>
          <Link href="/">
            <IconButton
              _icon={{
                as: AntDesign,
                name: 'back',
              }}
            />
          </Link>
          <HStack alignItems="center" flex={1} justifyContent="center" space={2}>
            <Avatar bg="primary.500" size="md" />
            <Heading fontSize="xl" textAlign="center">
              {shortenAccount}
            </Heading>
          </HStack>

          <Box w="48px" />
        </HStack>

        <Divider />
        <FlatList<Message>
          data={isLoading ? dummyItems : messages}
          renderItem={({ item }) => <MessageRow isLoading={isLoading} message={item} />}
        />
      </VStack>
    </Layout>
  ) : null;
}
