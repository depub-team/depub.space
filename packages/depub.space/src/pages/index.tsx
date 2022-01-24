import React, { FC, useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Divider,
  Text,
  Button,
  useToast,
  FormControl,
  Stack,
  FlatList,
  HStack,
  TextArea,
  VStack,
  WarningOutlineIcon,
} from 'native-base';
import { Layout, MessageRow } from '../components';
import { AppStateError, Message, useAppState, useSigningCosmWasmClient } from '../hooks';

interface MessageFormType {
  message: string;
}

const MAX_CHAR_LIMIT = 120;

interface MessageInputSectionProps {
  isLoading?: boolean;
  onSubmit: (data: MessageFormType) => void;
}

const MessageInputSection: FC<MessageInputSectionProps> = ({ onSubmit, isLoading }) => {
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

  const handleOnSubmit = async () => {
    await handleSubmit(onSubmit)();

    reset({ message: '' });
  };

  return (
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
                placeholder="Type something here..."
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
  );
};

interface ConnectSectionProps {
  onPress?: () => void;
  isLoading?: boolean;
}

const ConnectSection: FC<ConnectSectionProps> = ({ onPress, isLoading }) => (
  <VStack alignItems="center" flex={1} justifyContent="center" minHeight="180px" space={4}>
    <Button isLoading={isLoading} onPress={onPress}>
      Connect Keplr
    </Button>
    <Text fontSize="sm">depub.space only supports Keplr wallet</Text>
  </VStack>
);

export default function IndexPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const {
    error: connectError,
    isLoading: isConnectLoading,
    connectWallet,
    walletAddress,
  } = useSigningCosmWasmClient();
  const { isLoading, fetchMessages, postMessage } = useAppState();
  const toast = useToast();
  const dummyItems = Array.from(new Array(12)).map<Message>(() => ({
    id: `id-${Math.floor(Math.random() * 1000)}`,
    message: '',
    from: '',
    date: new Date(),
  }));

  const handleOnSubmit: SubmitHandler<MessageFormType> = async data => {
    try {
      const txn = await postMessage(data.message);

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
      const res = await fetchMessages();

      if (res) {
        setMessages(res.messages);
      }
    })();
  }, [fetchMessages]);

  useEffect(() => {
    if (connectError) {
      toast.show({
        title: connectError,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectError]);

  return (
    <Layout metadata={{ title: 'Home' }} walletAddress={walletAddress}>
      <VStack h="100%" maxWidth="480px" mx="auto" px={4} space={8} w="100%">
        {walletAddress ? (
          <MessageInputSection isLoading={isLoading} onSubmit={handleOnSubmit} />
        ) : (
          <ConnectSection isLoading={isConnectLoading} onPress={connectWallet} />
        )}

        <Divider />

        <FlatList<Message>
          data={isLoading ? dummyItems : messages}
          renderItem={({ item }) => <MessageRow isLoading={isLoading} message={item} />}
        />
      </VStack>
    </Layout>
  );
}
