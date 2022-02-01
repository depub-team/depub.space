import React, { FC } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AspectRatio, Box, HStack, Icon, Image, Pressable, Tooltip } from 'native-base';

export const ImagePreview: FC<{ image: ImagePicker.ImageInfo; onRemoveImage: () => void }> = ({
  image,
  onRemoveImage,
}) => (
  <HStack pb={4} space={4}>
    <Box key={image.uri} borderRadius="sm" flex={1} position="relative">
      <AspectRatio ratio={1}>
        <Image
          alt="Upload image"
          borderColor="gray.200"
          borderRadius="md"
          borderWidth={1}
          resizeMode="cover"
          source={{ uri: image.uri }}
          textAlign="center"
        />
      </AspectRatio>
      <Tooltip label="Remove" openDelay={250}>
        <Pressable position="absolute" right="0" top="0" onPress={onRemoveImage}>
          <Icon
            _dark={{
              color: 'white',
            }}
            _light={{
              color: 'black',
            }}
            as={Ionicons}
            borderRadius="full"
            name="close-circle"
          />
        </Pressable>
      </Tooltip>
    </Box>
  </HStack>
);
