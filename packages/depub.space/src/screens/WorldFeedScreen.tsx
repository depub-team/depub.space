import React, { FC, useState, useCallback, useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { VStack } from 'native-base';
import { useWindowDimensions } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Message } from '../interfaces';
import { AppStateError, useAppState, useWallet } from '../hooks';
import { MessageList, MessageFormType, useAlert, MessageComposer } from '../components/molecules';
import { waitAsync, dataUrlToFile, getLikecoinAddressByProfile } from '../utils';
import { Layout } from '../components/templates';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { NAV_HEADER_HEIGHT } from '../constants';

const debug = Debug('web:<WorldFeedScreen />');
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;

export type WorldFeedScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'WorldFeed'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const WorldFeedScreen: FC<WorldFeedScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isListReachedEnd, setIsListReachedEnd] = useState(false);
  const dimension = useWindowDimensions();
  const { isLoading: isConnectLoading, walletAddress, offlineSigner } = useWallet();
  const { profile, isLoading, fetchMessages, postMessage } = useAppState();
  const isLoggedIn = Boolean(walletAddress && !isConnectLoading);
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const userHandle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const alert = useAlert();

  const handleOnImagePress = useCallback((image: string, aspectRatio?: number) => {
    debug('handleOnImagePress(image: %s, aspectRatio: %d)', aspectRatio);

    navigation.navigate('Image', { image, aspectRatio });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnPress = useCallback((message: Message) => {
    const messageIscnId = message.id.replace(new RegExp(`^${ISCN_SCHEME}/`), '');

    navigation.push('Post', { id: messageIscnId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNewMessages = useCallback(async (previousId?: string, refresh?: boolean) => {
    debug('fetchNewMessages(previousId: %s, refresh: %O)', previousId, refresh);

    if (isLoadingMore || isListReachedEnd) {
      return;
    }

    setIsLoadingMore(true);

    const newMessages = await fetchMessages(previousId);

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
    () =>
      isLoggedIn ? (
        <VStack
          _dark={{
            bg: 'darkBlue.900',
            shadow: 'dark',
          }}
          _light={{ bg: 'white', shadow: 'light' }}
          mb={4}
          space={4}
          w="100%"
        >
          <MessageComposer isLoading={isLoading} onSubmit={handleOnSubmit} />
        </VStack>
      ) : undefined,
    [handleOnSubmit, isLoading, isLoggedIn]
  );

  useFocusEffect(
    useCallback(() => {
      // reset
      setIsListReachedEnd(true);

      void (async () => {
        await fetchNewMessages(undefined, true);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Layout
      metadata={{
        title: 'World Feed',
      }}
    >
      <MessageList
        data={messages}
        h={dimension.height - NAV_HEADER_HEIGHT}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        ListHeaderComponent={ListHeaderComponent}
        scrollEventThrottle={100}
        stickyHeaderIndices={isLoggedIn ? [0] : undefined} // sticky message composer if logged in
        onFetchData={fetchNewMessages}
        onImagePress={handleOnImagePress}
        onPress={handleOnPress}
      />
    </Layout>
  );
};
