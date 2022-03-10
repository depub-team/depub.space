import React, { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import {
  Text,
  Button,
  FormControl,
  Stack,
  HStack,
  TextArea,
  VStack,
  IStackProps,
  WarningOutlineIcon,
  IconButton,
  Icon,
  Tooltip,
  Collapse,
  Avatar,
  Box,
} from 'native-base';
import Debug from 'debug';
import { Link } from '@react-navigation/native';
import {
  getAbbrNickname,
  getLikecoinAddressByProfile,
  getShortenAddress,
  pickImageFromDevice,
} from '../../../utils';
import { MAX_CHAR_LIMIT } from '../../../constants';
import { ImagePreview } from './ImagePreview';
import { DesmosProfile } from '../../../interfaces';

const debug = Debug('web:<MessageComposer />');
const LINE_HEIGHT = 24;
const TEXTAREA_PADDING = 19;
const AnimatedTextArea = Animated.createAnimatedComponent(TextArea);

export interface MessageFormType {
  message: string;
}

export interface MessageComposerProps extends IStackProps {
  isLoading?: boolean;
  defaultValue?: string;
  profile: DesmosProfile | null;
  walletAddress: string | null;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: (data: MessageFormType, image?: string | null) => Promise<void> | void;
}

const areEqual = (prevProps: MessageComposerProps, nextProps: MessageComposerProps) => {
  const keys = ['isLoading', 'defaultValue', 'onSubmit', 'profile'] as Array<
    keyof MessageComposerProps
  >;

  return keys.every(key => prevProps[key] === nextProps[key]);
};

export const MessageComposer: FC<MessageComposerProps> = memo(
  ({ onSubmit, onBlur, onFocus, defaultValue, isLoading, walletAddress, profile, ...props }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [totalLines, setTotalLines] = useState(1);
    const blurTimeout = useRef(0);
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
    const shortenAddress =
      walletAddress &&
      getShortenAddress(`${walletAddress.slice(0, 10)}...${walletAddress.slice(-4)}`);
    const displayName = profile?.nickname || profile?.dtag || shortenAddress || '';
    const abbrNickname = getAbbrNickname(displayName);
    const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
    const handle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
    const profilePicSource = useMemo(
      () => (profile ? { uri: profile?.profilePic } : undefined),
      [profile]
    );

    const pickImage = async () => {
      debug('pickImage()');

      clearTimeout(blurTimeout.current);

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
      debug('handleOnSubmit()');

      clearTimeout(blurTimeout.current); // avoid goes to collapse state

      await handleSubmit(async data => {
        if (onSubmit) await onSubmit(data, image);

        setIsSubmitted(true);
      })();
    };

    const handleOnFocus = () => {
      setIsCollapsed(false);
      if (onFocus) onFocus();
    };

    const handleOnBlur = () => {
      blurTimeout.current = setTimeout(() => {
        setIsCollapsed(true);
        if (onBlur) onBlur();
      }, 500) as unknown as number;
    };

    const textAreaStyle = useAnimatedStyle(() => {
      const lineHeight = isCollapsed ? 1 : 4;

      return {
        height: withSpring(lineHeight * LINE_HEIGHT + TEXTAREA_PADDING, {}, () => {
          setTotalLines(lineHeight);
        }),
      };
    }, [isCollapsed]);

    const avatarStyle = useAnimatedStyle(
      () => ({
        maxWidth: withSpring(isCollapsed ? 0 : 48),
      }),
      [isCollapsed]
    );

    useEffect(() => {
      // reset state
      if (isSubmitted) {
        reset({ message: '' });

        setIsSubmitted(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitted]);

    // clear timeout when unmounting
    useEffect(
      () => () => {
        if (blurTimeout.current) {
          clearTimeout(blurTimeout.current);
        }
      },
      []
    );

    return (
      <VStack borderRadius="lg" p={4} space={isCollapsed ? 0 : 4} {...props}>
        <HStack flex={1} space={isCollapsed ? 0 : { base: 2, md: 4 }}>
          <Animated.View style={[{ flex: 1, overflow: 'hidden' }, avatarStyle]}>
            <Link
              to={{
                screen: 'User',
                params: {
                  account: handle,
                },
              }}
            >
              <Tooltip
                label={
                  likecoinAddress
                    ? 'This profile has linked to Likecoin'
                    : 'This profile has not linked to Likecoin'
                }
                openDelay={250}
              >
                <Avatar
                  borderColor={likecoinAddress ? 'primary.500' : 'gray.200'}
                  borderWidth={2}
                  size="md"
                  source={profilePicSource}
                >
                  {abbrNickname}
                </Avatar>
              </Tooltip>
            </Link>
          </Animated.View>
          <VStack flex={2}>
            <FormControl isInvalid={'message' in errors} isRequired>
              <Stack>
                <Controller
                  control={control}
                  defaultValue={defaultValue}
                  name="message"
                  render={({ field: { onChange, value } }) => (
                    <AnimatedTextArea
                      borderRadius={isCollapsed ? '3xl' : 'md'}
                      defaultValue={value}
                      fontSize={{
                        base: 'sm',
                        md: 'md',
                      }}
                      isReadOnly={isLoading}
                      maxLength={MAX_CHAR_LIMIT}
                      placeholder="Not your key, not your tweet. Be web3 native."
                      returnKeyType="done"
                      style={[textAreaStyle]}
                      totalLines={totalLines}
                      value={value}
                      onBlur={handleOnBlur}
                      onChangeText={onChange}
                      onFocus={handleOnFocus}
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
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
        </HStack>

        <Collapse isOpen={!isCollapsed}>
          <HStack alignItems="center" justifyContent="space-between" space={4}>
            <Box w={12} />
            <Tooltip label="Upload Image" openDelay={250}>
              <IconButton
                _icon={{ color: 'primary.500' }}
                borderRadius="full"
                icon={<Icon as={Ionicons} name="image-outline" />}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onPress={pickImage}
              />
            </Tooltip>

            <Text color="gray.400" fontSize="xs" ml="auto" textAlign="right">
              {(messageText || '').length} / {MAX_CHAR_LIMIT}
            </Text>
            <Button
              isLoading={isLoading}
              leftIcon={<Icon as={Ionicons} name="send" size="xs" />}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress={handleOnSubmit}
            >
              Submit
            </Button>
          </HStack>
        </Collapse>
      </VStack>
    );
  },
  areEqual
);
