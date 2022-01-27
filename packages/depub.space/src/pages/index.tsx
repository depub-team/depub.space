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
  FlatList,
  HStack,
  TextArea,
  VStack,
  WarningOutlineIcon,
  Skeleton,
  Avatar,
} from 'native-base';
import { RefreshControl } from 'react-native';
import { Message } from '../interfaces';
import { AppStateError, useAppState, useSigningCosmWasmClient } from '../hooks';
import { MessageCard, Layout } from '../components';
import { DesmosProfile } from '../utils';
import { END_REACHED_THRESHOLD } from '../contants';

interface MessageFormType {
  message: string;
}

const MAX_CHAR_LIMIT = 280;
const MAX_WIDTH = '640px';
const ROWS_PER_PAGE = 12;
const debug = Debug('web:<IndexPage />');
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

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
      mt={4}
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
  const [refreshing, setRefreshing] = React.useState(false);
  const [offset, setOffset] = useState(0);
  const [messagesWithPaging, setMessagesWithPaging] = useState(messages.slice(0, ROWS_PER_PAGE));
  const {
    error: connectError,
    isLoading: isConnectLoading,
    connectWallet,
    walletAddress,
    profile,
  } = useSigningCosmWasmClient();
  const { isLoading, fetchMessages, postMessage } = useAppState();
  const toast = useToast();
  const dummyItems = Array.from(new Array(12)).map<Message>(() => ({
    id: `id-${uid()}`,
    message: '',
    rawMessage: '',
    from: '',
    date: new Date(),
  }));

  const fetchNewMessages = async () => {
    const res = await fetchMessages();

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

  const handleOnSubmit: SubmitHandler<MessageFormType> = async data => {
    try {
      const txn = await postMessage(data.message);

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
    void fetchNewMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // get first batch of messages
  useEffect(() => {
    setMessagesWithPaging(messages.slice(0, ROWS_PER_PAGE));
  }, [messages]);

  useEffect(() => {
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
    <VStack maxW={MAX_WIDTH} mb={8} mx="auto" px={4} space={8} w="100%">
      {walletAddress && !isConnectLoading ? (
        <MessageInputSection
          address={walletAddress}
          isLoading={isLoading || isConnectLoading}
          profile={profile}
          onSubmit={handleOnSubmit}
        />
      ) : (
        <ConnectSection isLoading={isLoading || isConnectLoading} onPress={connectWallet} />
      )}

      <Divider />
    </VStack>
  ));

  const ListItemSeparatorComponent = memo(() => (
    <Divider maxW={MAX_WIDTH} mx="auto" my={4} w="100%" />
  ));

  return (
    <Layout metadata={{ title: 'Home' }}>
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
  );
}
