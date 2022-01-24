import React, { useEffect, useState } from 'react';
import { useToast, Divider, VStack, Heading, FlatList } from 'native-base';
import { useRouter } from 'next/router';
import { MessageRow, Layout } from '../../components';
import { Message, useAppState, useSigningCosmWasmClient } from '../../hooks';

export default function IndexPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  const account = router.query.account?.toString();
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
        return;
      }

      const res = await fetchMessagesByOwner(account);

      if (res) {
        setMessages(res.messages);
      }
    })();
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
        <Heading fontSize="xl">{account}</Heading>

        <Divider />
        <FlatList<Message>
          data={isLoading ? dummyItems : messages}
          renderItem={({ item }) => <MessageRow isLoading={isLoading} message={item} />}
        />
      </VStack>
    </Layout>
  ) : null;
}
