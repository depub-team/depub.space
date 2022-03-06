import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { Button, Text, VStack } from 'native-base';
import { useWindowDimensions } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Message } from '../interfaces';
import { AppStateError, useAppState, useWallet } from '../hooks';
import {
  MessageSectionList,
  MessageFormType,
  useAlert,
  MessageComposer,
} from '../components/molecules';
import { waitAsync, dataUrlToFile, getLikecoinAddressByProfile } from '../utils';
import { Layout } from '../components/templates';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { NAV_HEADER_HEIGHT } from '../constants';

const debug = Debug('web:<HomeScreen />');
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;

export type HomeScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HomeScreenNavigationProps = HomeScreenProps['navigation'];

export const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Array<{ title: string; data: Message[] }>>([]);
  const [selectedChannels, setSelectChannels] = useState<string[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const dimension = useWindowDimensions();
  const { isLoading: isConnectLoading, walletAddress, offlineSigner } = useWallet();
  const { profile, channels, isLoading, fetchMessagesByChannel, postMessage } = useAppState();
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

  const fetchNewMessages = useCallback(async () => {
    debug('fetchNewMessages()');

    if (isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    const newMessages = await Promise.all(
      selectedChannels.map(async chann => {
        const data = await fetchMessagesByChannel(chann, undefined, 3);

        return {
          title: chann,
          data,
        };
      })
    );

    setMessages(newMessages);

    setIsLoadingMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannels]);

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

  const ListFooterComponent = useMemo(
    () =>
      !isLoadingMore && !isLoading ? (
        <VStack
          _dark={{
            borderTopColor: 'gray.800',
          }}
          _light={{
            borderTopColor: 'gray.200',
          }}
          alignItems="center"
          bg="rgba(0,0,0,0.025)"
          borderTopWidth={1}
          justifyContent="center"
          px={4}
          py={32}
          space={4}
        >
          <Text>Go to World feed to explore more</Text>
          <Button
            variant="outline"
            onPress={() => {
              navigation.navigate('WorldFeed');
            }}
          >
            World Feed
          </Button>
        </VStack>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoadingMore, isLoading]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <VStack
        _dark={{
          bg: 'darkBlue.900',
          shadow: 'dark',
        }}
        _light={{ bg: 'white', shadow: 'light' }}
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

  useEffect(() => {
    // get first 5 channesl only
    setSelectChannels(channels.slice(0, 6).map(c => c.name));
  }, [channels]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await fetchNewMessages();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChannels])
  );

  return (
    <Layout
      metadata={{
        title: 'Home',
      }}
    >
      <MessageSectionList
        data={messages}
        h={dimension.height - NAV_HEADER_HEIGHT}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        ListFooterComponent={ListFooterComponent}
        ListHeaderComponent={ListHeaderComponent}
        scrollEventThrottle={100}
        stickyHeaderIndices={[0]}
        stickySectionHeadersEnabled
        onImagePress={handleOnImagePress}
        onPress={handleOnPress}
      />
    </Layout>
  );
};
