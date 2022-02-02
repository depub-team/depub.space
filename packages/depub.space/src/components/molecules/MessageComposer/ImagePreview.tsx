import React, { FC, useEffect, useState } from 'react';
import { AspectRatio, Box, HStack, Image, Tooltip } from 'native-base';
import { getSizeAsync } from '../../../utils';
import { CloseButton } from '../../atoms';

export const ImagePreview: FC<{ image: string; onRemoveImage: () => void }> = ({
  image,
  onRemoveImage,
}) => {
  const [imageAspect, setImageAspect] = useState(1);

  useEffect(() => {
    // eslint-disable-next-line func-names
    void (async function () {
      const { error, width, height } = await getSizeAsync(image);

      if (error || !width || !height) {
        return;
      }

      setImageAspect(width / height);
    })();
  }, [image]);

  return (
    <HStack pb={4} space={4}>
      <Box key={image} borderRadius="sm" flex={1} position="relative">
        <AspectRatio ratio={imageAspect}>
          <Image
            alt="Upload image"
            borderColor="gray.200"
            borderRadius="md"
            borderWidth={1}
            resizeMode="cover"
            source={{ uri: image }}
            textAlign="center"
          />
        </AspectRatio>
        <Tooltip label="Remove" openDelay={250}>
          <CloseButton onPress={onRemoveImage} />
        </Tooltip>
      </Box>
    </HStack>
  );
};
