import { Text, Stack, Heading, Image, AspectRatio, Box, IBoxProps, Link } from 'native-base';
import React, { FC } from 'react';
import { LinkPreview } from '../../../interfaces';

export interface LinkPreviewCardProps extends IBoxProps {
  preview: LinkPreview;
}

export const LinkPreviewCard: FC<LinkPreviewCardProps> = ({ preview }) => (
  <Box
    _dark={{
      borderColor: 'coolGray.600',
      backgroundColor: 'gray.700',
    }}
    _light={{
      backgroundColor: 'gray.50',
    }}
    borderColor="coolGray.200"
    borderWidth="1"
    overflow="hidden"
    rounded="lg"
  >
    <Box>
      {preview?.images?.length ? (
        <AspectRatio ratio={16 / 9} w="100%">
          <Image
            alt="image"
            source={{
              uri: preview.images[0],
            }}
          />
        </AspectRatio>
      ) : null}
    </Box>
    <Stack p={3} space={3}>
      <Stack space={2}>
        <Box>
          <Link href={preview.url} isExternal>
            <Text color="gray.500" fontSize="xs" fontWeight="500">
              {preview.url}
            </Text>
          </Link>
        </Box>
        <Box>
          <Link href={preview.url} isExternal>
            <Heading _dark={{ color: 'white' }} _light={{ color: 'black' }} size="sm">
              {preview.siteName || preview.url}
            </Heading>
          </Link>
        </Box>
      </Stack>
    </Stack>
  </Box>
);
