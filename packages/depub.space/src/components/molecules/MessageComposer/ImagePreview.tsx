import React, { FC } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Box, HStack, Icon, Image, Pressable, Tooltip } from 'native-base';

export const ImagePreview: FC<{ image: ImagePicker.ImageInfo; onRemoveImage: () => void }> = ({
  image,
  onRemoveImage,
}) => (
  <HStack pb={4} px={4} space={4}>
    <Box key={image.uri} position="relative">
      <Image alt="upload image" resizeMode="cover" size="2xl" source={{ uri: image.uri }} />
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
