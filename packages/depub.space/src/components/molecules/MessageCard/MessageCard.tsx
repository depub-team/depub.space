import React, { ComponentProps, FC, memo, useEffect, useState } from 'react';
import { getLinkPreview } from 'link-preview-js';
import {
  Image,
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
  useToast,
} from 'native-base';
import dayjs from 'dayjs';
import Debug from 'debug';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Platform } from 'react-native';
import { LinkPreviewItem, Message } from '../../../interfaces';
import { LinkPreview } from '../LinkPreview';
import { getAbbrNickname, getShortenAddress, messageSanitizer } from '../../../utils';
import { ImageModal } from '../ImageModal';

dayjs.extend(relativeTime);

const debug = Debug('web:<MessageCard />');
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;

export interface MessageCardProps extends ComponentProps<typeof HStack> {
  message: Message;
  isLoading?: boolean;
}

const MessageCardComponent: FC<MessageCardProps> = ({
  isLoading,
  message: { from, date, profile, images = [], message = '' },
  ...props
}) => {
  const shortenAddress = getShortenAddress(`${from.slice(0, 10)}...${from.slice(-4)}`);
  const dayFrom = dayjs(date).fromNow();
  const [linkPreivew, setLinkPreview] = useState<LinkPreviewItem | null>(null);
  const displayName = profile?.nickname || shortenAddress;
  const isMessageContainsUrl = /https?/.test(message);
  const abbrNickname = getAbbrNickname(displayName);
  const { onCopy } = useClipboard();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acitveImageIndex, setAcitveImageIndex] = useState(-1);
  const [imageSizes, setImageSizes] = useState<Array<[w: number, h: number]>>([]);

  useEffect(() => {
    if (!isMessageContainsUrl) {
      return;
    }

    // eslint-disable-next-line func-names
    void (async function () {
      try {
        const myLinkPreivew = (await getLinkPreview(message, {
          proxyUrl: `${PROXY_URL}/?`,
          timeout: 6000,
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
    <>
      <HStack
        flex={1}
        mb={{ base: 4, md: 6 }}
        minHeight="80px"
        px={4}
        space={4}
        w="100%"
        {...props}
      >
        <Skeleton isLoaded={!isLoading} rounded="full" size="12">
          <Avatar
            bg="gray.200"
            size="md"
            source={profile?.profilePic ? { uri: profile.profilePic } : undefined}
          >
            {abbrNickname}
          </Avatar>
        </Skeleton>

        <VStack flex={1} space={3}>
          <HStack alignItems="center" justifyContent="space-between">
            <VStack>
              <Skeleton.Text isLoaded={!isLoading} lines={1}>
                <Link href={`/users/?account=${from}`}>
                  <Text color="primary.500" fontSize="md" fontWeight="bold">
                    {displayName}
                  </Text>
                </Link>
              </Skeleton.Text>

              <Skeleton.Text isLoaded={!isLoading} lines={1}>
                <HStack space={1}>
                  {profile?.dtag ? (
                    <Tooltip label="Click to copy the nickname" openDelay={250}>
                      <Pressable
                        onPress={async () => {
                          await onCopy(profile.dtag);
                          toast.show({
                            title: 'The nickname has been copied!',
                            status: 'success',
                            placement: 'top',
                          });
                        }}
                      >
                        <Text color="gray.500" fontSize="sm">
                          @{profile.dtag}
                        </Text>
                      </Pressable>
                    </Tooltip>
                  ) : null}
                  <Tooltip label="Click to copy the wallet address" openDelay={250}>
                    <Pressable
                      onPress={async () => {
                        await onCopy(from);
                        toast.show({
                          title: 'The wallet address has been copied!',
                          status: 'success',
                          placement: 'top',
                        });
                      }}
                    >
                      <Text color="gray.500" fontSize="sm">
                        {profile?.dtag ? `(${shortenAddress})` : shortenAddress}
                      </Text>
                    </Pressable>
                  </Tooltip>
                </HStack>
              </Skeleton.Text>
            </VStack>

            <Skeleton.Text isLoaded={!isLoading} lines={1}>
              <Text color="gray.500" fontSize="xs" ml={8}>
                {dayFrom}
              </Text>
            </Skeleton.Text>
          </HStack>

          <Skeleton.Text isLoaded={!isLoading} lines={2} space={2}>
            <Text fontFamily="monospace" fontSize={{ base: 'md', md: 'lg' }} whiteSpace="pre-wrap">
              {Platform.OS === 'web' ? (
                // eslint-disable-next-line react/no-danger
                <div dangerouslySetInnerHTML={{ __html: messageSanitizer(message) }} />
              ) : null}
            </Text>
          </Skeleton.Text>

          {linkPreivew ? <LinkPreview flex={1} preview={linkPreivew} /> : null}

          <VStack space={2}>
            {images.map((image, index) => (
              <Pressable
                key={image}
                onPress={() => {
                  setIsModalOpen(true);
                  setAcitveImageIndex(index);
                }}
              >
                <AspectRatio
                  ratio={imageSizes[index] ? imageSizes[index][0] / imageSizes[index][1] : 1}
                >
                  <Image
                    alt={`Image ${index}`}
                    borderColor="gray.200"
                    borderWidth={1}
                    resizeMode="cover"
                    rounded="lg"
                    source={{ uri: image }}
                    textAlign="center"
                  />
                </AspectRatio>
              </Pressable>
            ))}
          </VStack>
        </VStack>
      </HStack>
      <ImageModal
        aspectRatio={
          imageSizes[acitveImageIndex]
            ? imageSizes[acitveImageIndex][0] / imageSizes[acitveImageIndex][1]
            : 1
        }
        isOpen={isModalOpen}
        source={{ uri: images[acitveImageIndex] }}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export const MessageCard = memo(MessageCardComponent);
