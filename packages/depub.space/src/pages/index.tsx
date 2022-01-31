import React, { FC, memo, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import Debug from 'debug';
import * as Yup from 'yup';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Divider,
  Text,
  Box,
  Button,
  useToast,
  FormControl,
  Stack,
  HStack,
  TextArea,
  VStack,
  WarningOutlineIcon,
  Skeleton,
  Avatar,
} from 'native-base';
import { Message } from '../interfaces';
import { AppStateError, useAppState, useSigningCosmWasmClient } from '../hooks';
import { Layout, MessageList, ConnectWallet } from '../components';
import { DesmosProfile } from '../utils';
import { MAX_WIDTH, MAX_CHAR_LIMIT } from '../contants';

interface MessageFormType {
  message: string;
}

const debug = Debug('web:<IndexPage />');

interface MessageInputSectionProps {
  isLoading?: boolean;
  address: string;
  profile: DesmosProfile | null;
  onSubmit: (data: MessageFormType) => void;
}

const MessageInputSection: FC<MessageInputSectionProps> = ({
  address,
  profile,
  onSubmit,
  isLoading,
}) => {
  const formSchema = Yup.object().shape({
    message: Yup.string()
      .required('Message is required')
      .min(4, 'Message length should be at least 4 characters')
      .max(MAX_CHAR_LIMIT, `Message must not exceed ${MAX_CHAR_LIMIT} characters`),
  });
  const validationOpt = { resolver: yupResolver(formSchema) };
  const { reset, formState, control, handleSubmit, watch } =
    useForm<MessageFormType>(validationOpt);
  const { errors } = formState;
  const [messageText] = watch(['message']);
  const displayName = profile ? profile.nickname || profile.address : address;
  const profilePic = profile?.profilePic;

  const handleOnSubmit = async () => {
    await handleSubmit(onSubmit)();

    reset({ message: '' });
  };

  return (
    <Stack
      direction={{
        base: 'column',
        md: 'row',
      }}
      flex={1}
      my={4}
      space={4}
    >
      <Box alignItems="center" flex={{ base: 1, md: 'unset' }}>
        <Skeleton isLoaded={!isLoading} rounded="full" size="12">
          <Avatar bg="gray.200" size="md" source={profilePic ? { uri: profilePic } : undefined}>
            {`${displayName[0]}${displayName[displayName.length - 1]}`}
          </Avatar>
        </Skeleton>
      </Box>
      <VStack flex={1} minHeight="180px" space={4}>
        <FormControl isInvalid={Boolean(errors.message)} isRequired>
          <Stack>
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, value } }) => (
                <TextArea
                  defaultValue={value}
                  isReadOnly={isLoading}
                  maxLength={MAX_CHAR_LIMIT}
                  placeholder="Not your key, not your tweet. Be web3 native."
                  returnKeyType="done"
                  value={value}
                  onChangeText={onChange}
                  onSubmitEditing={handleOnSubmit}
                />
              )}
            />
            {errors.message && (
              <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                {errors.message.message}
              </FormControl.ErrorMessage>
            )}
          </Stack>
        </FormControl>

        <HStack alignItems="center" justifyContent="space-between" space={4}>
          <Text color="gray.500" fontSize="xs" ml="auto" textAlign="right">
            {(messageText || '').length} / {MAX_CHAR_LIMIT}
          </Text>
          <Button isLoading={isLoading} onPress={handleOnSubmit}>
            Submit
          </Button>
        </HStack>
      </VStack>
    </Stack>
  );
};

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

  const handleOnSubmit: SubmitHandler<MessageFormType> = async data => {
    if (!offlineSigner) {
      toast.show({
        title: 'No valid signer, please connect wallet',
        status: 'error',
        placement: 'top',
      });

      return;
    }

    try {
      const txn = await postMessage(offlineSigner, data.message);

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
    debug('useEffect() -> connectError: %s', connectError);

    if (connectError) {
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
        <MessageInputSection
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
