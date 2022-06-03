import { Box, Text, Heading, Stack, VStack, View, Button } from 'native-base';
import React, { FC, memo } from 'react';
import { getAbbrNickname } from '../../../utils';
import { Avatar } from '../../atoms';

export interface UserHeaderProps {
  collapse?: boolean;
  bio?: string;
  dtag?: string;
  profilePic?: { uri: string };
  nickname: string;
  isNFTProfilePicture?: boolean;
  editable?: boolean;
  onEditProfilePicture?: () => void;
  // cover?: string;
}

const areEqual = (prevProps: UserHeaderProps, nextProps: UserHeaderProps) => {
  const keys = ['collapse', 'bio', 'dtag', 'profilePic', 'nickname', 'editable'] as Array<
    keyof UserHeaderProps
  >;

  return keys.every(key => prevProps[key] === nextProps[key]);
};

export const UserHeader: FC<UserHeaderProps> = memo(
  ({
    collapse,
    dtag,
    nickname,
    profilePic,
    bio,
    isNFTProfilePicture,
    editable,
    onEditProfilePicture,
  }) => {
    const abbrNickname = getAbbrNickname(nickname);

    return (
      <Box flex={1}>
        <Stack
          alignItems="center"
          flex={1}
          flexDirection={collapse ? 'row' : 'column'}
          justifyContent="center"
          py={4}
          space={4}
        >
          <View position="relative" w={collapse ? '12' : 'auto'}>
            <Avatar
              isNFTProfilePicture={isNFTProfilePicture}
              mr={collapse ? 4 : 0}
              size={collapse ? 'md' : 'xl'}
              source={profilePic}
            >
              {abbrNickname}
            </Avatar>

            {editable && !collapse && (
              <View
                borderRadius={isNFTProfilePicture ? 'none' : 'full'}
                h="100%"
                left={0}
                overflow="hidden"
                position="absolute"
                style={
                  isNFTProfilePicture
                    ? ({
                        maskImage: 'url(/images/hex.svg)',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                      } as any) // FIXME: type error, cannot use web style here
                    : undefined
                }
                top={0}
                w="100%"
              >
                <Button
                  _hover={{
                    backgroundColor: 'primary.500',
                  }}
                  _text={{
                    color: 'white',
                    fontSize: 'xs',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                  backgroundColor="rgba(0, 0, 0, 0.4)"
                  borderRadius="none"
                  bottom="0"
                  direction="column"
                  h="25%"
                  id="user-profile-picture-edit-button"
                  left="0"
                  p={0}
                  position="absolute"
                  variant="unstyled"
                  w="100%"
                  onPress={onEditProfilePicture}
                >
                  Edit
                </Button>
              </View>
            )}
          </View>
          <VStack
            alignItems={collapse ? 'flex-start' : 'center'}
            px={{ base: 3, md: 4, lg: 6 }}
            space={1}
          >
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
