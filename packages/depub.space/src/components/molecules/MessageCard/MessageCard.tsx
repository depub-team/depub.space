import React, { ComponentProps, FC, memo, useEffect, useState } from 'react';
import { getLinkPreview } from 'link-preview-js';
import { Link, Text, Skeleton, HStack, VStack, Avatar } from 'native-base';
import dayjs from 'dayjs';
import Debug from 'debug';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Platform } from 'react-native';
import { LinkPreview, Message } from '../../../interfaces';
import { LinkPreviewCard } from '../LinkPreviewCard';
import {
  DesmosProfile,
  fetchDesmosProfile,
  getAbbrNickname,
  getShortenAddress,
} from '../../../utils';

dayjs.extend(relativeTime);

const debug = Debug('web:<MessageCard />');
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;

export interface MessageCardProps extends ComponentProps<typeof HStack> {
  message: Message;
  isLoading?: boolean;
}

const MessageCardComponent: FC<MessageCardProps> = ({
  isLoading,
  message: { from, date, message, rawMessage },
  ...props
}) => {
  const shortenAddress = getShortenAddress(`${from.slice(0, 10)}...${from.slice(-4)}`);
  const dayFrom = dayjs(date).fromNow();
  const [profile, setProfile] = useState<DesmosProfile | null>(null);
  const [linkPreivew, setLinkPreview] = useState<LinkPreview | null>(null);
  const displayName = profile?.nickname || shortenAddress;
  const isMessageContainsUrl = /https?/.test(message);
  const abbrNickname = getAbbrNickname(displayName);

  useEffect(() => {
    if (!isMessageContainsUrl) {
      return;
    }

    // eslint-disable-next-line func-names
    void (async function () {
      try {
        const myLinkPreivew = (await getLinkPreview(rawMessage, {
          proxyUrl: `${PROXY_URL}/?`,
          timeout: 6000,
        })) as LinkPreview;

        debug('useEffect() -> rawMessage: %s, myLinkPreivew: %O', rawMessage, myLinkPreivew);

        if (myLinkPreivew) {
          setLinkPreview(myLinkPreivew);
        }
      } catch (ex) {
        debug('useEffect() -> error: %O', ex);
      }
    })();
  }, [rawMessage, isMessageContainsUrl]);

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      const authorProfile = await fetchDesmosProfile(from);

      if (authorProfile) {
        setProfile(authorProfile);
      }
    })();
  }, [from]);

  return (
    <HStack flex={1} mb={{ base: 4, md: 6 }} minHeight="80px" px={4} space={4} w="100%" {...props}>
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

            {profile?.dtag ? (
              <Skeleton.Text isLoaded={!isLoading} lines={1}>
                <Text color="gray.500" fontSize="sm">
                  @{profile.dtag}
                </Text>
              </Skeleton.Text>
            ) : null}
          </VStack>

          <Skeleton.Text isLoaded={!isLoading} lines={1}>
            <Text color="gray.500" fontSize="xs" ml={8}>
              {dayFrom}
            </Text>
          </Skeleton.Text>
        </HStack>

        <Skeleton.Text isLoaded={!isLoading} lines={2} space={2}>
          <Text fontFamily="monospace" fontSize={{ base: 'md', md: 'lg' }} whiteSpace="pre-wrap">
            {/* eslint-disable-next-line react/no-danger */}
            {Platform.OS === 'web' ? <div dangerouslySetInnerHTML={{ __html: message }} /> : null}
          </Text>
        </Skeleton.Text>

        {linkPreivew ? <LinkPreviewCard flex={1} preview={linkPreivew} /> : null}
      </VStack>
    </HStack>
  );
};

export const MessageCard = memo(MessageCardComponent);
