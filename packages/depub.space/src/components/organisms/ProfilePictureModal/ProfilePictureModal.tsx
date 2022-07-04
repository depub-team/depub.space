import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  Icon,
  Box,
  AlertDialog,
  Center,
  VStack,
  Select,
  Text,
  PresenceTransition,
  Spinner,
  Image,
  HStack,
  AspectRatio,
  Pressable,
  useBreakpointValue,
} from 'native-base';
import React, { useRef, FC, useState, useCallback, useEffect } from 'react';
import { checkIsNFTProfilePicture } from '../../../utils';
import { MAX_WIDTH } from '../../../constants';
import {
  getDesmosProfile,
  getStargazeNFTsByOwner,
  getOmniflixNFTsByOwner,
} from '../../../utils/queries';
import { Avatar } from '../../atoms';

export interface SelectedProfilePicture {
  image: string;
  platform: Platform;
}

export interface PostedMessageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onOk: (selectedProfilePicture: SelectedProfilePicture) => void;
  address: string;
  avatarName: string;
  defaultPlatform?: string;
  defaultAvatar?: string;
}

type Platform = 'desmos' | 'stargaze' | 'omniflix';

export const ProfilePictureModal: FC<PostedMessageModalProps> = ({
  address,
  isOpen,
  onClose,
  onOk,
  avatarName,
  defaultAvatar,
  defaultPlatform,
}) => {
  const [platform, setPlatform] = useState<Platform | undefined>(
    () => (defaultPlatform || 'desmos') as Platform
  );
  const cancelRef = useRef(null);
  const [preview, setPreview] = useState<{ uri: string } | undefined>(() =>
    defaultAvatar ? { uri: defaultAvatar } : undefined
  );
  const [previewPlatform, setPreviewPlatform] = useState<Platform | undefined>(() => platform);
  const [nfts, setNfts] = useState<{ uri: string }[]>(() => (preview ? [preview] : []));
  const [isLoading, setIsLoading] = useState(false);
  const colPerRow = useBreakpointValue({
    base: 1,
    md: 3,
    lg: 4,
  });
  const isNFTPlatform = checkIsNFTProfilePicture(previewPlatform);

  const handleOnOkPressed = useCallback(() => {
    if (preview && previewPlatform)
      onOk({
        image: preview.uri,
        platform: previewPlatform,
      });
  }, [onOk, preview, previewPlatform]);

  const handleOnImagePressed = useCallback(
    (imageSource: { uri: string }) => () => {
      setPreviewPlatform(platform);
      setPreview(imageSource);
    },
    [platform]
  );

  const handleOnPlatformChange = useCallback(
    async (value: Platform) => {
      setPlatform(value);
      setIsLoading(true);

      try {
        if (value === 'desmos') {
          const desmosProfile = await getDesmosProfile(address);

          setNfts(
            desmosProfile && desmosProfile.profilePic ? [{ uri: desmosProfile.profilePic }] : []
          );
        } else if (value === 'stargaze') {
          const stargazeNFTs = await getStargazeNFTsByOwner(address);

          // image only
          setNfts(
            stargazeNFTs
              .filter(nft => nft.mediaType.startsWith('image'))
              .map(nft => ({ uri: nft.media }))
          );
        } else if (value === 'omniflix') {
          const omniflixNFTs = await getOmniflixNFTsByOwner(address);

          // image only
          setNfts(
            omniflixNFTs
              .filter(nft => nft.mediaType.startsWith('image'))
              .map(nft => ({ uri: nft.media }))
          );
        }
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.error(ex);
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  useEffect(() => {
    if (isOpen) {
      if (defaultAvatar) {
        setPreview({ uri: defaultAvatar });
      }

      if (defaultPlatform) {
        setPlatform(defaultPlatform as Platform);
        setPreviewPlatform(defaultPlatform as Platform);

        void handleOnPlatformChange(defaultPlatform as Platform);
      }
    } else {
      setTimeout(() => {
        setPreview(undefined);
        setPlatform(undefined);
        setPreviewPlatform(undefined);
        setNfts([]);
      }, 1000);
    }
  }, [defaultAvatar, defaultPlatform, handleOnPlatformChange, isOpen]);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialog.Content maxW={MAX_WIDTH}>
        <AlertDialog.CloseButton />
        <AlertDialog.Header>Choose the NFT to be your profile picture</AlertDialog.Header>
        <AlertDialog.Body>
          <VStack
            px={{
              base: 2,
              md: 4,
            }}
            space={4}
            w="100%"
          >
            <Center>
              <Avatar isNFTProfilePicture={isNFTPlatform} size="3xl" source={preview}>
                {avatarName}
              </Avatar>
            </Center>
            <Select
              accessibilityLabel="Choose Platform"
              placeholder="Choose Platform"
              selectedValue={platform}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onValueChange={handleOnPlatformChange}
            >
              <Select.Item label="Desmos" value="desmos" />
              <Select.Item label="Stargaze" value="stargaze" />
              <Select.Item label="OmniFlix" value="omniflix" />
            </Select>

            <Box>
              {!isLoading && nfts.length > 0 && (
                <VStack space="1px">
                  {Array.from(new Array(Math.ceil((nfts.length / colPerRow) * colPerRow))).map(
                    (_, i) => (
                      <HStack key={`${i.toString()}`} space="2px">
                        {Array.from(new Array(colPerRow)).map((__, j) => {
                          const source = nfts[i * colPerRow + j];
                          const isSelected = source && preview?.uri === nfts[i + j].uri;

                          return (
                            <Box
                              key={`${j.toString()}-${i.toString()}`}
                              w={`calc(${Math.round(100 / colPerRow)}% - ${
                                j < colPerRow ? 2 : 0
                              }px)`}
                              zIndex={isSelected ? 2 : 1}
                            >
                              {isSelected && (
                                <Box
                                  alignSelf="flex-end"
                                  bg="green.500"
                                  borderColor="white"
                                  borderRadius="full"
                                  borderStyle="solid"
                                  borderWidth="1px"
                                  p={1}
                                  position="absolute"
                                  right={-6}
                                  top={-6}
                                  zIndex={2}
                                >
                                  <Icon
                                    as={<Ionicons />}
                                    color="white"
                                    name="md-checkmark-sharp"
                                    rounded="full"
                                    size="xs"
                                  />
                                </Box>
                              )}
                              {source && (
                                <Pressable onPress={handleOnImagePressed(source)}>
                                  <AspectRatio ratio={1}>
                                    <Image
                                      backgroundColor="gray.500"
                                      h="100%"
                                      resizeMode="cover"
                                      source={source}
                                      w="100%"
                                      zIndex={1}
                                    />
                                  </AspectRatio>
                                </Pressable>
                              )}
                            </Box>
                          );
                        })}
                      </HStack>
                    )
                  )}
                </VStack>
              )}

              {!isLoading && nfts.length < 1 && (
                <Center>
                  <Text fontSize="sm">
                    {checkIsNFTProfilePicture(platform)
                      ? 'No NFT found. Please try another platform.'
                      : 'No profile picture in your Desmos profile'}
                  </Text>
                </Center>
              )}

              <PresenceTransition
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 250,
                  },
                }}
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                visible={isLoading}
              >
                <Spinner accessibilityLabel="Loading NFTs" size="lg" />
              </PresenceTransition>
            </Box>
          </VStack>
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button.Group space={2}>
            <Button
              ref={cancelRef}
              _disabled={{
                colorScheme: 'gray',
              }}
              colorScheme="primary"
              id="submit-update-profile-picture-button"
              isDisabled={!preview || !previewPlatform}
              onPress={handleOnOkPressed}
            >
              OK
            </Button>
          </Button.Group>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
