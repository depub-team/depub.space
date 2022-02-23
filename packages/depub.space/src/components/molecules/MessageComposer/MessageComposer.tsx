import React, { FC, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import {
  Text,
  Box,
  Button,
  FormControl,
  Stack,
  HStack,
  TextArea,
  VStack,
  WarningOutlineIcon,
  Avatar,
  IconButton,
  Icon,
  Tooltip,
} from 'native-base';
import Debug from 'debug';
import { getAbbrNickname, getLikecoinAddressByProfile, pickImageFromDevice } from '../../../utils';
import { MAX_CHAR_LIMIT } from '../../../contants';
import { ImagePreview } from './ImagePreview';
import { DesmosProfile } from '../../../interfaces';

const debug = Debug('web:<MessageComposer />');

export interface MessageFormType {
  message: string;
}

interface MessageComposerProps {
  isLoading?: boolean;
  defaultValue?: string;
  address: string;
  profile: DesmosProfile | null;
  onSubmit: (data: MessageFormType, image?: string | null) => Promise<void>;
}
export const MessageComposer: FC<MessageComposerProps> = ({
  address,
  profile,
  onSubmit,
  defaultValue,
  isLoading,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formSchema = Yup.object().shape({
    message: Yup.string()
      .required('Message is required')
      .min(4, 'Message length should be at least 4 characters')
      .max(MAX_CHAR_LIMIT, `Message must not exceed ${MAX_CHAR_LIMIT} characters`),
  });
  const validationOpt = { resolver: yupResolver(formSchema) };
  const { reset, formState, control, handleSubmit, watch } =
    useForm<MessageFormType>(validationOpt);
  const { errors } = formState;
  const [messageText] = watch(['message']);
  const displayName = profile ? profile.nickname || profile.address : address;
  const abbrNickname = getAbbrNickname(displayName);
  const profilePic = profile?.profilePic;
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);

  const pickImage = async () => {
    debug('pickImage()');

    try {
      const result = await pickImageFromDevice();

      debug('pickImage() -> result: %O', result);

      if (result) {
        setImage(result);
      }
    } catch (ex) {
      debug('pickImage() -> error: %O', ex);
    }
  };

  const handleOnSubmit = async () => {
    await handleSubmit(async data => {
      await onSubmit(data, image);

      setIsSubmitted(true);
    })();
  };

  useEffect(() => {
    // reset state
    if (isSubmitted) {
      reset({ message: '' });

      setIsSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);

  return (
    <Stack
      direction={{
        base: 'column',
        md: 'row',
      }}
      flex={1}
      mt={4}
      space={4}
    >
      <Box alignItems="center" flex={{ base: '0 0 48px', md: 'unset' }}>
        <Tooltip
          label={
            likecoinAddress
              ? 'This profile has linked to Likecoin'
              : 'This profile has not linked to Likecoin'
          }
          openDelay={250}
        >
          <Avatar
            bg="gray.200"
            borderColor={likecoinAddress ? 'primary.500' : 'gray.200'}
            borderWidth={2}
            size="md"
            source={profilePic ? { uri: profilePic } : undefined}
          >
            {abbrNickname}
          </Avatar>
        </Tooltip>
      </Box>
      <VStack flex={1} minHeight="180px" space={4}>
        <VStack space={4}>
          <FormControl isInvalid={'message' in errors} isRequired>
            <Stack>
              <Controller
                control={control}
                defaultValue={defaultValue}
                name="message"
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    defaultValue={value}
                    isReadOnly={isLoading}
                    maxLength={MAX_CHAR_LIMIT}
                    placeholder="Not your key, not your tweet. Be web3 native."
                    returnKeyType="done"
                    value={value}
                    onChangeText={onChange}
                    onSubmitEditing={handleOnSubmit}
                  />
                )}
              />
              <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                {errors.message?.message}
              </FormControl.ErrorMessage>
            </Stack>
          </FormControl>

          {image ? <ImagePreview image={image} onRemoveImage={() => setImage(null)} /> : null}
        </VStack>

        <HStack alignItems="center" justifyContent="space-between" mb={4} space={4}>
          <Tooltip label="Upload Image" openDelay={250}>
            <IconButton
              _icon={{ color: 'primary.500' }}
              icon={<Icon as={Ionicons} name="image-outline" />}
              onPress={pickImage}
            />
          </Tooltip>

          <Text color="gray.500" fontSize="xs" ml="auto" textAlign="right">
            {(messageText || '').length} / {MAX_CHAR_LIMIT}
          </Text>
          <Button isLoading={isLoading} onPress={handleOnSubmit}>
            Submit
          </Button>
        </HStack>
      </VStack>
    </Stack>
  );
};
