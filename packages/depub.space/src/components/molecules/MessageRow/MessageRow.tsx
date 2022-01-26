import React, { FC } from 'react';
import { Link, Divider, Text, Skeleton, HStack, VStack, Avatar } from 'native-base';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Platform } from 'react-native';
import { Message } from '../../../interfaces';
import { useDesmosProfile } from '../../../hooks';

dayjs.extend(relativeTime);

export interface MessageRowProps {
  message: Message;
  isLoading?: boolean;
}
export const MessageRow: FC<MessageRowProps> = ({
  isLoading,
  message: { from, date, message },
}) => {
  const shortenWalletAddress = `${from.slice(0, 10)}...${from.slice(-4)}`;
  const { profile } = useDesmosProfile(from);
  const dayFrom = dayjs(date).fromNow();
  const displayName = profile?.nickname || shortenWalletAddress;

  return (
    <>
      <HStack flex={1} mb={{ base: 4, md: 6 }} minHeight="80px" space={4} w="100%">
        <Skeleton isLoaded={!isLoading} rounded="full" size="12">
          <Avatar
            bg="primary.500"
            size="md"
            source={profile ? { uri: profile.profilePicture } : undefined}
          >
            {`${displayName[0]}${displayName[displayName.length - 1]}`}
          </Avatar>
        </Skeleton>

        <VStack flex={1} space={2}>
          <HStack alignItems="center" justifyContent="space-between">
            <VStack>
              <Skeleton.Text isLoaded={!isLoading} lines={1}>
                <Link href={`/users/?account=${from}`}>
                  <Text color="primary.500" fontSize="md" fontWeight="bold">
                    {displayName}
                  </Text>
                </Link>
              </Skeleton.Text>

              {profile ? (
                <Skeleton.Text isLoaded={!isLoading} lines={1}>
                  <Text color="gray.500" fontSize="sm">
                    @{profile?.dtag}
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
        </VStack>
      </HStack>
      <Divider mb={{ base: 4, md: 6 }} />
    </>
  );
};
