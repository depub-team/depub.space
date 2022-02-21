import * as ImagePicker from 'expo-image-picker';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

export const getSize = (url: string) =>
  new Promise<{ width?: number; height?: number; error?: Error }>(resolve => {
    Image.getSize(
      url,
      (width, height) => resolve({ width, height }),
      error => resolve({ error })
    );
  });

export const getSizeAsync = async (url: string) => {
  const { width, height, error } = await getSize(url);

  if (error) {
    return { error };
  }

  return { width, height };
};

export const manipulateImage = async (uri: string, maxWidth: number) => {
  const { width, height, error } = await getSizeAsync(uri);

  if (error || !width || !height || width <= maxWidth) {
    return uri;
  }

  const resizeWidth = maxWidth;
  const ratio = maxWidth / width;
  const resizeHeight = height * ratio;
  const resizeResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: resizeWidth, height: resizeHeight } }],
    {
      base64: false,
      compress: 1,
      format: ImageManipulator.SaveFormat.PNG,
    }
  );

  return resizeResult.uri;
};

export const pickImageFromDevice = async () => {
  const pickResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsMultipleSelection: false,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (pickResult.cancelled) {
    return null;
  }

  const { uri } = pickResult as unknown as ImagePicker.ImagePickerResult & ImageInfo;

  const resizeURI = await manipulateImage(uri, 1080);

  return resizeURI;
};
