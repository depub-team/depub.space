import React, { FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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
} from 'native-base';
import Debug from 'debug';
import { pickImageFromDevice } from '../../../utils';
import { MAX_CHAR_LIMIT } from '../../../constants';
import { ImagePreview } from './ImagePreview';

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
  onSubmit?: (data: MessageFormType, image?: string | null) => Promise<void> | void;
}

export const MessageComposer: FC<MessageComposerProps> = memo(
  ({ onSubmit, defaultValue, isLoading, ...props }) => {
    const [image, setImage] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isFocusing, setIsFocusing] = useState(false);
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
    const height = useSharedValue(1);
    const containerStyles = useMemo(
      () => ({
        _dark: {
          bg: isFocusing ? 'darkBlue.900' : undefined,
        },
        _light: {
          bg: isFocusing ? '#fff' : undefined,
        },
      }),
      [isFocusing]
    );
    const textAreaStyles = useMemo(
      () => ({
        _dark: {
          bg: 'darkBlue.900',
        },
        _light: {
          bg: 'light.100',
        },
      }),
      []
    );

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
      clearTimeout(blurTimeout.current); // avoid goes to collapse state

      await handleSubmit(async data => {
        if (onSubmit) await onSubmit(data, image);

        setIsSubmitted(true);
      })();
    };

    const handleOnFocus = () => {
      setIsCollapsed(false);
      setIsFocusing(true);
    };

    const handleOnBlur = () => {
      blurTimeout.current = setTimeout(() => {
        setIsCollapsed(true);
        setIsFocusing(false);
      }, 100) as unknown as number;
    };

    const textAreaStyle = useAnimatedStyle(() => ({
      height: withSpring(height.value * LINE_HEIGHT + TEXTAREA_PADDING, {}, () => {
        setTotalLines(height.value);
      }),
    }));

    // trigger animation when state changed
    useEffect(() => {
      height.value = isCollapsed ? 1 : 4;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCollapsed]);

    useEffect(() => {
      // reset state
      if (isSubmitted) {
        reset({ message: '' });

        setIsSubmitted(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitted]);

    return (
      <VStack
        borderRadius="lg"
        mt={isCollapsed ? 0 : 4}
        p={4}
        shadow={isFocusing ? 'lg' : 'none'}
        space={isCollapsed ? 0 : 4}
        {...containerStyles}
        {...props}
      >
        <VStack>
          <FormControl isInvalid={'message' in errors} isRequired>
            <Stack>
              <Controller
                control={control}
                defaultValue={defaultValue}
                name="message"
                render={({ field: { onChange, value } }) => (
                  <AnimatedTextArea
                    _dark={textAreaStyles}
                    borderRadius={isCollapsed ? '3xl' : 'md'}
                    defaultValue={value}
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

        <Collapse isOpen={!isCollapsed}>
          <HStack alignItems="center" justifyContent="space-between" space={4}>
            <Tooltip label="Upload Image" openDelay={250}>
              <IconButton
                _icon={{ color: 'primary.500' }}
                borderRadius="full"
                icon={<Icon as={Ionicons} name="image-outline" />}
                onPress={() => {
                  void pickImage();
                }}
              />
            </Tooltip>

            <Text color="gray.400" fontSize="xs" ml="auto" textAlign="right">
              {(messageText || '').length} / {MAX_CHAR_LIMIT}
            </Text>
            <Button
              isLoading={isLoading}
              leftIcon={<Icon as={Ionicons} name="send" size="xs" />}
              onPress={() => {
                void handleOnSubmit();
              }}
            >
              Submit
            </Button>
          </HStack>
        </Collapse>
      </VStack>
    );
  }
);
