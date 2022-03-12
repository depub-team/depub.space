import { Text, Stack, Heading, Image, AspectRatio, Box, IBoxProps, Link } from 'native-base';
import React, { FC, useMemo } from 'react';
import { LinkPreviewItem } from '../../../interfaces';

export interface LinkPreviewProps extends IBoxProps {
  preview: LinkPreviewItem;
}

const style = {
  _dark: {
    borderColor: 'coolGray.600',
    backgroundColor: 'gray.700',
  },
  _light: {
    backgroundColor: 'gray.50',
  },
  borderColor: 'coolGray.200',
  borderWidth: '1',
  overflow: 'hidden',
  rounded: 'lg',
};

const headingStyle = {
  _dark: { color: 'white' },
  _light: { color: 'black' },
  size: 'sm',
};

export const LinkPreview: FC<LinkPreviewProps> = ({ preview }) => {
  const imageSource = useMemo(
    () => ({
      uri: preview.images[0],
    }),
    [preview]
  );

  return (
    <Box {...style}>
      <Box>
        {preview?.images?.length ? (
          <AspectRatio ratio={16 / 9} w="100%">
            <Image alt="image" source={imageSource} />
          </AspectRatio>
        ) : null}
      </Box>
      <Stack p={3} space={3}>
        <Stack space={2}>
          <Box>
            <Link href={preview.url} isExternal>
              <Text color="gray.400" fontSize="xs" fontWeight="500">
                {preview.url}
              </Text>
            </Link>
          </Box>
          <Box>
            <Link href={preview.url} isExternal>
              <Heading {...headingStyle}>{preview.siteName || preview.url}</Heading>
            </Link>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
