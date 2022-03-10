import { Avatar, Box, Text, Heading, Stack, VStack } from 'native-base';
import React, { FC, memo } from 'react';
import { getAbbrNickname } from '../../../utils';

export interface UserHeaderProps {
  collapse?: boolean;
  bio?: string;
  dtag?: string;
  profilePic?: string;
  nickname: string;
  // cover?: string;
}

const areEqual = (prevProps: UserHeaderProps, nextProps: UserHeaderProps) => {
  const keys = ['collapse', 'bio', 'dtag', 'profilePic', 'nickname'] as Array<
    keyof UserHeaderProps
  >;

  return keys.every(key => prevProps[key] === nextProps[key]);
};

export const UserHeader: FC<UserHeaderProps> = memo(
  ({ collapse, dtag, nickname, profilePic, bio }) => {
    const abbrNickname = getAbbrNickname(nickname);

    return (
      <Box flex={1} mb={collapse ? 4 : 8}>
        <Stack
          _dark={{
            bg: 'darkBlue.900',
            shadow: 'dark',
          }}
          _light={{ bg: 'white', shadow: 'light' }}
          alignItems="center"
          flex={1}
          flexDirection={collapse ? 'row' : 'column'}
          justifyContent="center"
          py={4}
          space={4}
        >
          <Avatar mr={collapse ? 4 : 0} size={collapse ? 'md' : 'lg'} source={{ uri: profilePic }}>
            {abbrNickname}
          </Avatar>
          <VStack alignItems={collapse ? 'flex-start' : 'center'} space={1}>
            <Box textAlign={collapse ? 'left' : 'center'}>
              <Heading fontSize="xl">{nickname}</Heading>
              {dtag ? (
                <Text color="gray.400" fontSize="sm">
                  @{dtag}
                </Text>
              ) : null}
            </Box>
            {!collapse && bio ? <Text fontSize="sm">{bio}</Text> : null}
          </VStack>
        </Stack>
      </Box>
    );
  },
  areEqual
);
