import React, { useMemo, ComponentProps, FC, memo, useCallback, useEffect, useState } from 'react';
import { getLinkPreview } from 'link-preview-js';
import {
  Image,
  Box,
  Link,
  Text,
  Skeleton,
  HStack,
  VStack,
  Avatar,
  AspectRatio,
  Pressable,
  Tooltip,
  useClipboard,
  Icon,
  IconButton,
  useColorMode,
} from 'native-base';
import dayjs from 'dayjs';
import Debug from 'debug';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinkPreviewItem, Message } from '../../../interfaces';
import { LinkPreview } from '../LinkPreview';
import {
  getUrlFromContent,
  getAbbrNickname,
  getShortenAddress,
  messageSanitizer,
  getLikecoinAddressByProfile,
} from '../../../utils';
import { useAlert } from '../Alert';

dayjs.extend(relativeTime);

const debug = Debug('web:<MessageCard />');
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const ISCN_SCHEME = process.env.NEXT_PUBLIC_ISCN_SCHEME;
const isDev = process.env.NODE_ENV !== 'production';

export interface MessageCardProps extends ComponentProps<typeof HStack> {
  message: Message;
  isLoading?: boolean;
  onShare?: (message: Message) => void;
  onAvatarPress?: (handle: string) => void;
  onImagePress?: (image: string, aspectRatio?: number) => void;
}

const areEqual = (prevProps: MessageCardProps, nextProps: MessageCardProps) =>
  prevProps.message.id === nextProps.message.id;

export const MessageCard: FC<MessageCardProps> = memo(
  ({ isLoading, onShare, onAvatarPress, onImagePress, message: messageItem, ...props }) => {
    const { id, from, date, profile, images = [], message = '' } = messageItem;
    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === 'dark';
    const iscnId = id.replace(new RegExp(`^${ISCN_SCHEME}/`), '');
    const [copyIconState, setCopyIconState] = useState<'copied' | 'normal'>('normal');
    const shareableUrl = isDev ? `${APP_URL}/?id=${iscnId}` : `${APP_URL}/${iscnId}`;
    const shortenAddress = getShortenAddress(`${from.slice(0, 10)}...${from.slice(-4)}`);
    const dayFrom = dayjs(date).fromNow();
    const [linkPreivew, setLinkPreview] = useState<LinkPreviewItem | null>(null);
    const displayName = profile?.nickname || profile?.dtag || shortenAddress;
    const isMessageContainsUrl = /https?/.test(message);
    const abbrNickname = getAbbrNickname(displayName);
    const { onCopy } = useClipboard();
    const [imageSizes, setImageSizes] = useState<Array<[w: number, h: number]>>([]);
    const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
    const handle = likecoinAddress && profile?.dtag ? profile.dtag : from;
    const isCopied = copyIconState === 'copied';
    const isLoaded = !isLoading;
    const alert = useAlert();
    const profilePicSource = useMemo(() => ({ uri: profile?.profilePic || undefined }), [profile]);
    const imageSources = useMemo(() => images.map(image => ({ uri: image })), [images]);
    const iscnBadgeSource = useMemo(
      () => ({
        uri: isDev
          ? `https://static.like.co/badge/iscn/testnet/${id}.svg?dark=${
              isDarkMode ? '1' : '0'
            }&responsive=0&width=120`
          : `https://static.like.co/badge/iscn/${id}.svg?dark=${
              isDarkMode ? '1' : '0'
            }&responsive=0&width=120`,
      }),
      [id, isDarkMode]
    );

    const copyUrl = async () => {
      await onCopy(shareableUrl);

      setCopyIconState('copied');

      setTimeout(() => {
        setCopyIconState('normal');
      }, 2000);

      alert.show({
        title: 'The URL has been copied to clipboard!',
        status: 'success',
      });

      return null;
    };

    const handleOnShare = useCallback(
      (item: Message) => () => {
        if (onShare) onShare(item);
      },
      [onShare]
    );

    const handleOnAvatarPress = useCallback(() => {
      if (onAvatarPress) onAvatarPress(handle);
    }, [onAvatarPress, handle]);

    const handleOnImagePress = useCallback(
      (image, aspectRatio) => () => {
        if (onImagePress) onImagePress(image, aspectRatio);
      },
      [onImagePress]
    );

    const renderContent = useCallback(
      () =>
        Platform.OS === 'web' ? (
          <>
            <style jsx>{`
              .MessageCard__content {
                font-weight: 500;
              }
              .MessageCard__content > :global(a) {
                color: #07d6a0;
              }
            `}</style>
            <div
              className="MessageCard__content"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: messageSanitizer(message) }}
            />
          </>
        ) : null,
      [message]
    );

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
      <HStack flex={1} minHeight="80px" my={2} px={4} space={4} w="100%" {...props}>
        <Skeleton isLoaded={isLoaded} rounded="full" size="12">
          <Pressable onPress={handleOnAvatarPress}>
            <Tooltip
              label={
                likecoinAddress
                  ? 'This profile has linked to Likecoin'
                  : 'This profile has not linked to Likecoin'
              }
              openDelay={250}
            >
              <Avatar
                bg="gray.200"
                borderColor={likecoinAddress ? 'primary.500' : 'gray.200'}
                borderWidth={2}
                size="md"
                source={profilePicSource}
              >
                {abbrNickname}
              </Avatar>
            </Tooltip>
          </Pressable>
        </Skeleton>

        <VStack flex={1} space={4}>
          <HStack alignItems="center" justifyContent="space-between">
            <Skeleton.Text flex={1} isLoaded={isLoaded} lines={2}>
              <VStack flex={1}>
                <Pressable onPress={handleOnAvatarPress}>
                  <Text color="primary.500" fontSize="md" fontWeight="bold">
                    {displayName}
                  </Text>
                </Pressable>

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

          <Skeleton.Text isLoaded={isLoaded} lines={2} space={2}>
            <Text
              fontFamily="text"
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="500"
              whiteSpace="pre-wrap"
            >
              {renderContent()}
            </Text>
          </Skeleton.Text>

          {linkPreivew ? <LinkPreview flex={1} preview={linkPreivew} /> : null}

          {images.length ? (
            <VStack space={2}>
              {images.map((image, index) => {
                const aspectRatio = imageSizes[index]
                  ? imageSizes[index][0] / imageSizes[index][1]
                  : 1;

                return (
                  <Pressable key={image} onPress={handleOnImagePress(image, aspectRatio)}>
                    <AspectRatio ratio={aspectRatio}>
                      <Image
                        alt={`Image ${index}`}
                        borderColor="gray.200"
                        borderWidth={1}
                        resizeMode="cover"
                        rounded="lg"
                        source={imageSources[index]}
                        textAlign="center"
                      />
                    </AspectRatio>
                  </Pressable>
                );
              })}
            </VStack>
          ) : null}

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
                  <Link href={`https://app.like.co/view/${encodeURIComponent(id)}`} isExternal>
                    <Image alt="ISCN badge" h={26} source={iscnBadgeSource} w={120} />
                  </Link>
                </Tooltip>
              </Skeleton>

              <Skeleton isLoaded={isLoaded} size="8">
                <Tooltip
                  closeOnClick={false}
                  label={isCopied ? 'Copied!' : 'Copy URL'}
                  openDelay={250}
                >
                  <IconButton
                    _icon={{
                      color: isCopied ? 'primary.500' : 'gray.400',
                      size: 'sm',
                    }}
                    _pressed={{
                      bg: 'transparent',
                    }}
                    borderRadius="full"
                    icon={
                      <Icon
                        as={MaterialCommunityIcons}
                        name={isCopied ? 'link-variant-plus' : 'link-variant'}
                      />
                    }
                    onPress={() => {
                      void copyUrl();
                    }}
                  />
                </Tooltip>
              </Skeleton>

              {onShare ? (
                <Skeleton isLoaded={isLoaded} size="8">
                  <Tooltip label="Share post" openDelay={250}>
                    <IconButton
                      _icon={{ color: 'gray.400', size: 'sm' }}
                      borderRadius="full"
                      icon={<Icon as={Ionicons} name="share-social" />}
                      onPress={handleOnShare(messageItem)}
                    />
                  </Tooltip>
                </Skeleton>
              ) : null}
            </HStack>
          </HStack>
        </VStack>
      </HStack>
    );
  },
  areEqual
);
