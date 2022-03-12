import React, { useMemo, ComponentProps, FC, memo, useCallback, useEffect, useState } from 'react';
import { getLinkPreview } from 'link-preview-js';
import {
  Image,
  Box,
  Text,
  Skeleton,
  HStack,
  VStack,
  Avatar,
  AspectRatio,
  Link as NBLink,
  Tooltip,
  useClipboard,
  Icon,
  IconButton,
  useColorMode,
} from 'native-base';
import dayjs from 'dayjs';
import Debug from 'debug';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useNavigation } from '@react-navigation/native';
import { LinkPreviewItem, Message } from '../../../interfaces';
import { LinkPreview } from '../LinkPreview';
import {
  getUrlFromContent,
  getAbbrNickname,
  getShortenAddress,
  getLikecoinAddressByProfile,
} from '../../../utils';
import type { HomeScreenNavigationProps } from '../../../navigation';
import { MessageCardContainer } from './MessageCardContainer';
import { MessageContent } from './MessageContent';
import { useAppState } from '../../../hooks';

dayjs.extend(relativeTime);

const debug = Debug('web:<MessageCard />');
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;
const ISCN_BADGE_URL = process.env.NEXT_PUBLIC_ISCN_BADGE_URL;
const isDev = process.env.NODE_ENV !== 'production';

export interface MessageCardProps extends ComponentProps<typeof HStack> {
  message: Message;
  isLoading?: boolean;
}

const emptyImageSizes: [w: number, h: number][] = [];
const emptyImages: string[] = [];

const areEqual = (prevProps: MessageCardProps, nextProps: MessageCardProps) =>
  prevProps.message.id === nextProps.message.id;

export const MessageCard: FC<MessageCardProps> = memo(
  ({ isLoading, message: messageItem, ...props }) => {
    const { id, from, date, profile, message = '', images = emptyImages } = messageItem;
    const { colorMode } = useColorMode();
    const navigation = useNavigation<HomeScreenNavigationProps>();
    const isDarkMode = colorMode === 'dark';
    const [iscnId, revision] = id.replace(new RegExp(`^${ISCN_SCHEME}/`), '').split('/');
    const [copyIconState, setCopyIconState] = useState<'copied' | 'normal'>('normal');
    const shareableUrl = isDev
      ? `${APP_URL}/post?id=${iscnId}/${revision}`
      : `${APP_URL}/post/${iscnId}/${revision}`;
    const shortenAddress = getShortenAddress(`${from.slice(0, 10)}...${from.slice(-4)}`);
    const dayFrom = dayjs(date).fromNow();
    const [linkPreivew, setLinkPreview] = useState<LinkPreviewItem | null>(null);
    const isMessageContainsUrl = /https?/.test(message);
    const displayName = profile?.nickname || profile?.dtag || shortenAddress;
    const abbrNickname = getAbbrNickname(displayName);
    const { onCopy } = useClipboard();
    const { showImageModal } = useAppState();
    const [imageSizes, setImageSizes] = useState<Array<[w: number, h: number]>>(emptyImageSizes);
    const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
    const handle = likecoinAddress && profile?.dtag ? profile.dtag : from;
    const isCopied = copyIconState === 'copied';
    const isLoaded = !isLoading;
    const profilePicSource = useMemo(
      () => (profile ? { uri: profile?.profilePic } : undefined),
      [profile]
    );
    const imageSources = useMemo(() => images.map(image => ({ uri: image })), [images]);

    const copyIconButtonStyle = useMemo(
      () => ({
        _icon: {
          color: isCopied ? 'primary.500' : 'gray.400',
          size: 'sm',
        },
        _pressed: {
          bg: 'transparent',
        },
        borderRadius: 'full',
        icon: (
          <Icon
            as={MaterialCommunityIcons}
            name={isCopied ? 'link-variant-plus' : 'link-variant'}
          />
        ),
      }),
      [isCopied]
    );

    const iscnBadgeSource = useMemo(
      () => ({
        uri: `${ISCN_BADGE_URL}/${id}.svg?dark=${isDarkMode ? '1' : '0'}&responsive=0&width=120`,
      }),
      [id, isDarkMode]
    );

    const toUserRoute = useMemo(
      () => ({
        screen: 'User',
        params: {
          account: handle,
        },
      }),
      [handle]
    );

    const handleOnImagePress = (image: string, aspectRatio: number) => () => {
      showImageModal(image, aspectRatio);
    };

    const copyUrl = useCallback(async () => {
      await onCopy(shareableUrl);

      setCopyIconState('copied');

      setTimeout(() => {
        setCopyIconState('normal');
      }, 2000);

      return null;
    }, [onCopy, shareableUrl]);

    const handleOnPress = (e: any) => {
      debug('handleOnPress(e: %O)', e);

      e.preventDefault();

      // handle content links
      if (e.target.tagName === 'A') {
        const link = e.target.getAttribute('href') as string;

        if (/^\/channel/.test(link)) {
          const execArr = /^\/channel\/(.+)$/.exec(link);

          if (execArr && execArr[1]) {
            navigation.navigate('Channel', {
              name: execArr[1],
            });
          }
        } else if (/^\/user/.test(link)) {
          const execArr = /^\/user\/(.+)$/.exec(link);

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

          const myLinkPreivew = (await getLinkPreview(url, {
            proxyUrl: `${PROXY_URL}/?`,
            timeout: 6000,
            headers: {
              'user-agent': 'googlebot',
            },
          })) as LinkPreviewItem;

          debug('useEffect() -> message: %s, myLinkPreivew: %O', message, myLinkPreivew);

          if (myLinkPreivew) {
            setLinkPreview(myLinkPreivew);
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

    return (
      <MessageCardContainer {...props}>
        <Box alignSelf="flex-start">
          <Skeleton isLoaded={isLoaded} rounded="full" size="12">
            <Link to={toUserRoute}>
              <Tooltip
                label={
                  likecoinAddress
                    ? 'This profile has linked to Likecoin'
                    : 'This profile has not linked to Likecoin'
                }
                openDelay={250}
              >
                <Avatar
                  borderColor={likecoinAddress ? 'primary.500' : 'gray.200'}
                  borderWidth={2}
                  size="md"
                  source={profilePicSource}
                >
                  {abbrNickname}
                </Avatar>
              </Tooltip>
            </Link>
          </Skeleton>
        </Box>

        <VStack flex={1}>
          <HStack alignItems="center" justifyContent="space-between">
            <Skeleton.Text flex={1} isLoaded={isLoaded} lines={2}>
              <VStack flex={1}>
                <Link to={toUserRoute}>
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
                    <Text color="gray.400" fontSize="sm">
                      {profile?.dtag ? `(${shortenAddress})` : shortenAddress}
                    </Text>
                  </Tooltip>
                </HStack>
              </VStack>
            </Skeleton.Text>
          </HStack>

          <VStack flex={1} space={4}>
            <Pressable onPress={handleOnPress}>
              <Skeleton.Text isLoaded={isLoaded} lines={2} space={2}>
                <MessageContent content={message} />
              </Skeleton.Text>
            </Pressable>

            {linkPreivew ? <LinkPreview flex={1} preview={linkPreivew} /> : null}

            {images.length ? (
              <VStack flex={1} space={2}>
                {images.map((image, index) => {
                  const aspectRatio = imageSizes[index]
                    ? imageSizes[index][0] / imageSizes[index][1]
                    : 1;

                  return (
                    <AspectRatio key={image} maxW="100%" ratio={aspectRatio}>
                      <Pressable onPress={handleOnImagePress(image, aspectRatio)}>
                        <Image
                          alt={`Image ${index}`}
                          borderColor="gray.200"
                          borderWidth={1}
                          h="100%"
                          resizeMode="cover"
                          rounded="lg"
                          source={imageSources[index]}
                          textAlign="center"
                          w="100%"
                        />
                      </Pressable>
                    </AspectRatio>
                  );
                })}
              </VStack>
            ) : null}
          </VStack>

          <HStack alignItems="center" justifyContent="space-between" space={4}>
            <Box>
              <Skeleton.Text isLoaded={isLoaded} lines={1}>
                <Text color="gray.400" fontSize="xs">
                  {dayFrom}
                </Text>
              </Skeleton.Text>
            </Box>

            <HStack alignItems="center" space={1}>
              <Skeleton isLoaded={isLoaded} size="8">
                <Tooltip label="Check ISCN record" openDelay={250}>
                  <NBLink href={`https://app.like.co/view/${encodeURIComponent(id)}`} isExternal>
                    <Image alt="ISCN badge" h={26} source={iscnBadgeSource} w={120} />
                  </NBLink>
                </Tooltip>
              </Skeleton>

              <Skeleton isLoaded={isLoaded} size="8">
                <Tooltip
                  closeOnClick={false}
                  label={isCopied ? 'Copied!' : 'Copy URL'}
                  openDelay={250}
                >
                  <IconButton
                    {...copyIconButtonStyle}
                    // eslint-disable-next-line  @typescript-eslint/no-misused-promises
                    onPress={copyUrl}
                  />
                </Tooltip>
              </Skeleton>
            </HStack>
          </HStack>
        </VStack>
      </MessageCardContainer>
    );
  },
  areEqual
);
