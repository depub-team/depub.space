import React, { FC, useState, useCallback, useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { useWindowDimensions } from 'react-native';
import { VStack } from 'native-base';
import { Layout, MessageComposer, MessageFormType, MessageList, useAlert } from '../components';
import { Message } from '../interfaces';
import { AppStateError, useAppState, useWallet } from '../hooks';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { NAV_HEADER_HEIGHT } from '../constants';
import { dataUrlToFile, getLikecoinAddressByProfile, waitAsync } from '../utils';

const debug = Debug('web:<ChannelScreen />');
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;

export type ChannelScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'Channel'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ChannelScreen: FC<ChannelScreenProps> = ({ navigation, route }) => {
  const name = decodeURIComponent(route.params.name);
  const [messages, setMessages] = useState<Message[]>([]);
  const dimension = useWindowDimensions();
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const { isLoading: isConnectLoading, walletAddress, offlineSigner } = useWallet();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { profile, postMessage, isLoading, fetchMessagesByChannel } = useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const userHandle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const alert = useAlert();

  const fetchNewMessages = useCallback(
    async (previousId?: string, refresh?: boolean) => {
      debug('fetchNewMessages(previousId: %s, refresh: %O)', previousId, refresh);

      if (isLoadingMore || isListReachedEnd) {
        return;
      }

      setIsLoadingMore(true);

      const newMessages = await fetchMessagesByChannel(name, previousId);

      if (newMessages) {
        if (!refresh) {
          if (newMessages.length === 0) {
            setIsListReachedEnd(true);
          }

          setMessages(msgs => Array.from(new Set(msgs.concat(newMessages))));
        } else {
          setMessages(newMessages);
        }
      }

      setIsLoadingMore(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isListReachedEnd]
  );

  const handleOnPress = useCallback((message: Message) => {
    debug('handleOnPress(message: %O)', message);

    const messageIscnId = message.id.replace(new RegExp(`^${ISCN_SCHEME}/`), '');

    navigation.navigate('Post', { id: messageIscnId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnImagePress = useCallback((image: string, aspectRatio?: number) => {
    debug('handleOnImagePress(image: %s, aspectRatio: %d)', aspectRatio);

    navigation.navigate('Image', { image, aspectRatio });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnSubmit = useCallback(
    async (data: MessageFormType, image?: string | null) => {
      try {
        let file: File | undefined;

        if (image) {
          file = await dataUrlToFile(image, 'upload');
        }

        if (!offlineSigner) {
          alert.show({
            title: 'No valid signer, please connect wallet',
            status: 'error',
          });

          return;
        }

        const txn = await postMessage(offlineSigner, data.message, file && [file]);

        await waitAsync(500); // wait a bit

        setIsListReachedEnd(false); // reset

        window.location.href = `/user/${userHandle}`;

        if (txn) {
          alert.show({
            title: 'Post created successfully!',
            status: 'success',
          });
        }
      } catch (ex: any) {
        alert.show({
          title:
            ex instanceof AppStateError
              ? ex.message
              : 'Something went wrong, please try again later',
          status: 'error',
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offlineSigner, postMessage, userHandle]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <VStack
        _dark={{
          bg: 'darkBlue.900',
          shadow: 'dark',
        }}
        _light={{ bg: 'white', shadow: 'light' }}
        mb={8}
        space={4}
        w="100%"
      >
        {isLoggedIn ? (
          <MessageComposer isLoading={isLoading} onSubmit={handleOnSubmit} />
        ) : undefined}
      </VStack>
    ),
    [handleOnSubmit, isLoading, isLoggedIn]
  );

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: `#${name}`,
      });

      // reset
      setIsListReachedEnd(true);

      void (async () => {
        await fetchNewMessages(undefined, true);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name])
  );

  return (
    <Layout metadata={{ title: `#${name}` || undefined }}>
      <MessageList
        data={messages}
        h={dimension.height - NAV_HEADER_HEIGHT}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        ListHeaderComponent={ListHeaderComponent}
        scrollEventThrottle={100}
        stickyHeaderIndices={[0]}
        onFetchData={fetchNewMessages}
        onImagePress={handleOnImagePress}
        onPress={handleOnPress}
      />
    </Layout>
  );
};
