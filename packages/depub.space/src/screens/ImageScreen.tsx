import Debug from 'debug';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { FC } from 'react';
import { CompositeScreenProps } from '@react-navigation/native';
import { ImageModal } from '../components/organisms/ImageModal';
import { RootStackParamList } from '../navigation/RootStackParamList';
import { MainStackParamList } from '../navigation/MainStackParamList';

const debug = Debug('web:<ImageScreen />');

export type ImageScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Image'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const ImageScreen: FC<ImageScreenProps> = ({ navigation, route }) => {
  const { image, aspectRatio } = route.params;

  debug('image: %s, imageAspectRatio: %d', image, aspectRatio);

  return image ? (
    <ImageModal
      aspectRatio={aspectRatio || 1}
      isOpen
      source={{ uri: image }}
      onClose={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('Home');
        }
      }}
    />
  ) : null;
};
