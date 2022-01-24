import React, { FC } from 'react';
import { Link, Divider, Text, Skeleton, HStack, VStack, Avatar } from 'native-base';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Message } from '../../../hooks';

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
  const dayFrom = dayjs(date).fromNow();

  return (
    <>
      <HStack flex={1} mb={{ base: 4, md: 6 }} minHeight="80px" space={4} w="100%">
        <Skeleton isLoaded={!isLoading} rounded="full" size="12">
          <Avatar bg="black" size="md" />
        </Skeleton>

        <VStack flex={1} space={2}>
          <HStack alignItems="center" justifyContent="space-between">
            <Skeleton.Text isLoaded={!isLoading} lines={1}>
              <Link href={`/users?account=${from}`}>
                <Text fontSize="sm" fontWeight="bold">
                  {shortenWalletAddress}
                </Text>
              </Link>
            </Skeleton.Text>

            <Skeleton.Text isLoaded={!isLoading} lines={1}>
              <Text color="gray.500" fontSize="sm" ml={8}>
                {dayFrom}
              </Text>
            </Skeleton.Text>
          </HStack>

          <Skeleton.Text isLoaded={!isLoading} lines={2} space={2}>
            <Text fontFamily="monospace" fontSize="lg" whiteSpace="pre-wrap">
              {message}
            </Text>
          </Skeleton.Text>
        </VStack>
      </HStack>
      <Divider mb={{ base: 4, md: 6 }} />
    </>
  );
};
