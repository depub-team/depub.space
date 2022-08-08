import React, {
  useMemo,
  ComponentProps,
  FC,
  memo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { getLinkPreview } from 'link-preview-js';
import {
  Image,
  Box,
  Text,
  HStack,
  VStack,
  Tooltip,
  useClipboard,
  Icon,
  IconButton,
  useToast,
  Menu,
} from 'native-base';
import dayjs from 'dayjs';
import Debug from 'debug';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useNavigation } from '@react-navigation/native';
import { getLikeCount } from 'packages/depub.space/src/utils/likecoin/getLikeCount';
import { LinkPreviewItem, Message } from '../../../interfaces';
import { LinkPreview } from '../LinkPreview';
import {
  getUrlFromContent,
  getAbbrNickname,
  getShortenAddress,
  checkIsNFTProfilePicture,
} from '../../../utils';
import type { HomeScreenNavigationProps } from '../../../navigation';
import { MessageCardContainer } from './MessageCardContainer';
import { MessageContent } from './MessageContent';
import { useAppState } from '../../../hooks';
import { Avatar, LikeClap } from '../../atoms';

dayjs.extend(relativeTime);

const debug = Debug('web:<MessageCard />');
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;
const isDev = process.env.NODE_ENV !== 'production';

export interface MessageCardProps extends ComponentProps<typeof HStack> {
  message: Message;
}

const emptyImageSizes: [w: number, h: number][] = [];
const emptyImages: string[] = [];

const areEqual = (prevProps: MessageCardProps, nextProps: MessageCardProps) =>
  prevProps.message.id === nextProps.message.id;

export const MessageCard: FC<MessageCardProps> = memo(({ message: messageItem, ...props }) => {
  const { id, from, date, profile, message = '', images = emptyImages } = messageItem;
  const toast = useToast();
  const [contentContainerWidth, setContentContainerWidth] = useState(0);
  const navigation = useNavigation<HomeScreenNavigationProps>();
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [iscnId, revision] = id.replace(new RegExp(`^${ISCN_SCHEME}/`), '').split('/');
  const shareableUrl = isDev
    ? `${APP_URL}/post?id=${iscnId}/${revision}`
    : `${APP_URL}/${iscnId}/${revision}`;
  const shortenAddress = getShortenAddress(`${from.slice(0, 10)}...${from.slice(-4)}`);
  const dayFrom = dayjs(date).fromNow();
  const [linkPreview, setLinkPreview] = useState<LinkPreviewItem | null>(null);
  const isMessageContainsUrl = /https?/.test(message);
  const displayName = profile?.nickname || profile?.dtag || shortenAddress;
  const abbrNickname = getAbbrNickname(displayName);
  const [likeCount, setLikeCount] = useState(0);
  const { onCopy } = useClipboard();
  const { showImageModal, likePost } = useAppState();
  const [imageSizes, setImageSizes] = useState<Array<[w: number, h: number]>>(emptyImageSizes);
  const likecoinAddress = profile && profile.address;
  const handle = likecoinAddress && profile?.dtag ? profile.dtag : from;
  const profilePicSource = useMemo(
    () => (profile && profile?.profilePic ? { uri: profile.profilePic } : undefined),
    [profile]
  );
  const imageSources = useMemo(() => images.map(image => ({ uri: image })), [images]);
  const isNFTProfilePicture =
    profile?.isNFTProfilePicture || checkIsNFTProfilePicture(profile?.profilePicProvider || '');

  const handleOnImagePress = useCallback(
    (image: string, aspectRatio: number) => () => {
      showImageModal(image, aspectRatio);
    },
    [showImageModal]
  );

  const handleOnLike = useCallback(() => {
    likePost(id);
  }, [id, likePost]);

  const handleCheckISCN = useCallback(() => {
    const link = `https://app.like.co/view/${encodeURIComponent(id)}`;

    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener noreferrer');
    }
  }, [id]);

  const copyAddress = useCallback(async () => {
    await onCopy(from);

    toast.show({
      description: 'Copied',
    });
  }, [onCopy, toast, from]);

  const copyUrl = useCallback(async () => {
    await onCopy(shareableUrl);

    toast.show({
      description: 'Copied',
    });

    return null;
  }, [onCopy, toast, shareableUrl]);

  const handleOnPress = (e: any) => {
    debug('handleOnPress(e: %O)', e);

    e.preventDefault();

    // handle content links
    if (e.target.tagName === 'A') {
      const link = e.target.getAttribute('href') as string;

      if (/^\/hashtag/.test(link)) {
        // hash tag
        const execArr = /^\/hashtag\/(.+)$/.exec(link);

        if (execArr && execArr[1]) {
          navigation.navigate('HashTag', {
            name: execArr[1],
          });
        }
      } else if (/^\/([\p{L}\d_-]+)/.test(link)) {
        // user handle
        const execArr = /^\/(.+)$/.exec(link);

        if (execArr && execArr[1]) {
          navigation.navigate('User', {
            account: execArr[1],
          });
        }
      } else if (typeof window !== 'undefined') {
        window.open(link, '_blank', 'noopener noreferrer');
      }

      return;
    }

    navigation.navigate('Post', { id: iscnId, revision });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    if (!isMessageContainsUrl) {
      return;
    }

    // eslint-disable-next-line func-names
    void (async function () {
      try {
        const url = getUrlFromContent(message);

        if (!url) {
          return;
        }

        const myLinkPreview = (await getLinkPreview(url, {
          proxyUrl: `${PROXY_URL}/?`,
          timeout: 6000,
          headers: {
            'user-agent': 'googlebot',
          },
        })) as LinkPreviewItem;

        debug('useEffect() -> message: %s, myLinkPreview: %O', message, myLinkPreview);

        if (myLinkPreview) {
          setLinkPreview(myLinkPreview);
        }
      } catch (ex) {
        debug('useEffect() -> error: %O', ex);
      }
    })();
  }, [message, isMessageContainsUrl]);

  // get all image resolutions
  useEffect(() => {
    images.forEach((image, i) => {
      (Image.getSize as any)(image, (w: number, h: number) => {
        setImageSizes(imgSizes => {
          const clone = [...imgSizes];

          clone[i] = [w, h];

          return clone;
        });
      });
    });
  }, [images]);

  // get content container width
  useEffect(() => {
    const handleWindowResize = () => {
      if (contentContainerRef.current) {
        setContentContainerWidth(contentContainerRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleWindowResize);

    handleWindowResize();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    if (!likecoinAddress) {
      return;
    }

    getLikeCount(id)
      .then(({ total }) => setLikeCount(total))
      .catch(err => {
        debug('getLikeCount() -> error: %O', err);
      });
  }, [id, likecoinAddress]);

  return (
    <MessageCardContainer {...props}>
      <Box alignSelf="flex-start">
        <Link to={`/${handle}`}>
          <Avatar isNFTProfilePicture={isNFTProfilePicture} size="md" source={profilePicSource}>
            {abbrNickname}
          </Avatar>
        </Link>
      </Box>

      <VStack flex={1} space={2}>
        <HStack alignItems="center" justifyContent="space-between">
          <VStack flex={1}>
            <Link to={`/${handle}`}>
              <Text color="primary.500" fontSize="md" fontWeight="bold">
                {displayName}
              </Text>
            </Link>

            <HStack space={1}>
              {profile?.dtag ? (
                <Text color="gray.400" fontSize="sm">
                  @{profile.dtag}
                </Text>
              ) : null}
              <Tooltip label="Click to copy the wallet address" openDelay={250}>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <Text color="gray.400" fontSize="sm" onPress={copyAddress}>
                  {profile?.dtag ? `(${shortenAddress})` : shortenAddress}
                </Text>
              </Tooltip>
            </HStack>
          </VStack>

          <Box alignItems="flex-start">
            <Menu
              // eslint-disable-next-line react/no-unstable-nested-components
              trigger={triggerProps => (
                <Pressable accessibilityLabel="More options menu" {...triggerProps}>
                  <Icon as={MaterialCommunityIcons} name="dots-vertical" size="sm" />
                </Pressable>
              )}
            >
              <Menu.Item onPress={handleCheckISCN}>Check ISCN Record</Menu.Item>
              {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
              <Menu.Item onPress={copyUrl}>Copy sharable URL</Menu.Item>
            </Menu>
          </Box>
        </HStack>

        <VStack ref={contentContainerRef} space={4}>
          <Pressable onPress={handleOnPress}>
            <MessageContent content={message} />
          </Pressable>

          {images.length ? (
            <VStack space={2}>
              {images.map((image, index) => {
                const aspectRatio = imageSizes[index]
                  ? imageSizes[index][0] / imageSizes[index][1]
                  : 1;
                const imageHeight = contentContainerWidth / aspectRatio;

                return (
                  <Pressable key={image} onPress={handleOnImagePress(image, aspectRatio)}>
                    <Image
                      alt={`Image ${index}`}
                      borderColor="gray.200"
                      borderWidth={1}
                      h={imageHeight}
                      resizeMode="cover"
                      rounded="lg"
                      source={imageSources[index]}
                      textAlign="center"
                      w={contentContainerWidth}
                    />
                  </Pressable>
                );
              })}
            </VStack>
          ) : null}

          {linkPreview ? <LinkPreview flex={1} preview={linkPreview} /> : null}
        </VStack>

        <HStack alignItems="center" justifyContent="space-between" pt={4} space={4}>
          <HStack alignItems="center" space={4}>
            <HStack alignItems="center" position="relative">
              <Tooltip label="Like it? clap to show your appreciation">
                <IconButton
                  _dark={{
                    bg: 'darkBlue.900',
                  }}
                  _hover={{
                    backgroundColor: 'primary.500',
                    borderColor: 'primary.500',
                    color: 'white',
                  }}
                  _light={{
                    bg: 'white',
                  }}
                  borderColor="primary.600"
                  borderRadius="full"
                  borderStyle="solid"
                  borderWidth={2}
                  color="primary.500"
                  icon={<LikeClap height="24" width="24" />}
                  paddingBottom="4px"
                  paddingLeft="4px"
                  paddingRight="4px"
                  paddingTop="4px"
                  zIndex={2}
                  onPress={handleOnLike}
                />
              </Tooltip>
              <Box
                bg="primary.500:alpha.40"
                borderLeftRadius={0}
                borderRadius="full"
                marginLeft="-2"
                paddingBottom={1}
                paddingLeft="3"
                paddingRight="2"
                paddingTop={1}
                zIndex={1}
              >
                <Text
                  _dark={{
                    color: 'white',
                  }}
                  _light={{
                    color: 'text',
                  }}
                  fontSize="sm"
                >
                  {likeCount}
                </Text>
              </Box>
            </HStack>
            <Text color="gray.400" fontSize="xs">
              {dayFrom}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </MessageCardContainer>
  );
}, areEqual);
