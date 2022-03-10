import React, { FC, useState, useCallback, useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Debug from 'debug';
import { useWindowDimensions } from 'react-native';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Message } from '../interfaces';
import { useAppState } from '../hooks';
import { MessageSectionList } from '../components/molecules/MessageSectionList';
import { Layout } from '../components/templates';
import { MainStackParamList } from '../navigation/MainStackParamList';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { NAV_HEADER_HEIGHT } from '../constants';
import { ListLoading } from '../components/atoms';

const debug = Debug('web:<HomeScreen />');
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;

export type HomeScreenProps = CompositeScreenProps<
  DrawerScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HomeScreenNavigationProps = HomeScreenProps['navigation'];

export const HomeScreen: FC<HomeScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Array<{ title: string; data: Message[] }>>([]);
  const [selectedHashTags, setSelectedHashTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dimension = useWindowDimensions();
  const { hashTags, isLoading: isAppLoading, fetchMessagesByHashTag } = useAppState();
  const isLoadingShow = isLoading || isAppLoading;

  const handleOnImagePress = useCallback((image: string, aspectRatio?: number) => {
    debug('handleOnImagePress(image: %s, aspectRatio: %d)', aspectRatio);

    navigation.push('Image', { image, aspectRatio });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnPress = useCallback((message: Message) => {
    const messageIscnId = message.id.replace(new RegExp(`^${ISCN_SCHEME}/`), '');

    navigation.push('Post', { id: messageIscnId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNewMessages = useCallback(async () => {
    debug('fetchNewMessages()');

    setIsLoading(true);

    const newMessages = await Promise.all(
      selectedHashTags.map(async hashTag => {
        const { data } = await fetchMessagesByHashTag(hashTag, undefined, 3);

        return {
          title: hashTag,
          data,
        };
      })
    );

    setIsLoading(false);

    setMessages(newMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHashTags, messages]);

  useEffect(() => {
    // get first 5 channesl only
    setSelectedHashTags(hashTags.slice(0, 6).map(c => c.name));
  }, [hashTags]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await fetchNewMessages();
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHashTags])
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
        isLoading={isLoadingShow}
        isLoadingMore={isLoadingShow}
        ListFooterComponent={isLoadingShow ? <ListLoading /> : null}
        scrollEventThrottle={100}
        onImagePress={handleOnImagePress}
        onPress={handleOnPress}
      />
    </Layout>
  );
};
