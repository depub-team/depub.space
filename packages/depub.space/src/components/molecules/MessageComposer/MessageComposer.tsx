import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Switch,
  Tooltip,
  Collapse,
  Box,
} from 'native-base';
import Debug from 'debug';
import { Link } from '@react-navigation/native';
import twttr from 'twitter-text'
import { getAbbrNickname, getShortenAddress, pickImageFromDevice } from '../../../utils';
import { MAX_CHAR_LIMIT } from '../../../constants';
import { Avatar } from '../../atoms';
import { ImagePreview } from './ImagePreview';
import { UserProfile } from '../../../interfaces';
import { MessageComposerContainer } from './MessageComposerContainer';

const debug = Debug('web:<MessageComposer />');
const LINE_HEIGHT = 24;
const TEXTAREA_PADDING = 19;
const AnimatedTextArea = Animated.createAnimatedComponent(TextArea);
const stackSpacing = { base: 2, md: 4 };
const textAreaFontSize = {
  base: 'sm',
  md: 'md',
};
const iconColor = { color: 'primary.500' };

export interface MessageFormType {
  message: string;
}

export interface MessageComposerProps extends IStackProps {
  isLoading?: boolean;
  defaultValue?: string;
  profile: UserProfile | undefined;
  walletAddress: string | undefined;
  isCollapsed?: boolean;
  autoFocus?: boolean;
  isTwitterLoggedIn?: boolean;
  onFocus?: () => void;
  onTwitterLogin?: () => void;
  onTwitterLogout?: () => void;
  onSubmit?: (data: MessageFormType, image?: string | undefined) => Promise<void> | void;
}

export const MessageComposer: FC<MessageComposerProps> = ({
  onSubmit,
  defaultValue = '',
  isLoading,
  walletAddress,
  profile,
  onTwitterLogin,
  onTwitterLogout,
  isTwitterLoggedIn = false,
  isCollapsed = false,
  onFocus,
  autoFocus,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [image, setImage] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalLines, setTotalLines] = useState(1);
  const blurTimeout = useRef(0);
  const parseTwitterPostLength = (message: string | undefined): number => {
    const { weightedLength } = twttr.parseTweet(message || '')

    return weightedLength
  }

  const formSchema = Yup.object().shape({
    message: Yup.string()
      .required('Message is required')
      .min(4, 'Message length should be at least 4 characters')
      .test(
        'twitter-char-count',
        `Message must not exceed ${MAX_CHAR_LIMIT} characters`,
        (value) => parseTwitterPostLength(value) <= MAX_CHAR_LIMIT
      )
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
  const likecoinAddress = profile && profile.address;
  const handle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const profilePicSource = useMemo(
    () => (profile ? { uri: profile?.profilePic } : undefined),
    [profile]
  );
  const charCount = useMemo(
    () => parseTwitterPostLength(messageText),
    [messageText]
  )

  const pickImage = useCallback(async () => {
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
  }, []);

  const handleMessage = useCallback((message: string) => {
    debug('handleMessage()', message);
    let decodedMessage = message

    try {
      decodedMessage = decodeURI(message)
    } catch (error) {
      debug(error)
    }

    return decodedMessage
  }, [])

  const handleOnSubmit = useCallback(async () => {
    debug('handleOnSubmit()');

    clearTimeout(blurTimeout.current); // avoid goes to collapse state

    await handleSubmit(async data => {
      if (onSubmit) await onSubmit(data, image);

      setIsSubmitted(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, onSubmit]);

  const textAreaStyle = useAnimatedStyle(() => {
    const lineHeight = isCollapsed ? 1 : 4;

    return {
      height: withSpring(lineHeight * LINE_HEIGHT + TEXTAREA_PADDING, {}, () => {
        setTotalLines(lineHeight);
      }),
    };
  }, [isCollapsed]);

  const handleTwitterToggle = useCallback(() => {
    if (isTwitterLoggedIn && onTwitterLogout) {
      onTwitterLogout();

      return;
    }

    if (onTwitterLogin) {
      onTwitterLogin();
    }
  }, [isTwitterLoggedIn, onTwitterLogout, onTwitterLogin]);

  useEffect(() => {
    // reset state
    if (isSubmitted) {
      reset({ message: '' });
      setImage(undefined);
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

  // auto focus
  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <MessageComposerContainer ref={containerRef} isCollapsed={isCollapsed} {...props}>
      <HStack flex={1} space={stackSpacing}>
        <Link to={`/${handle}`}>
          <Avatar
            isNFTProfilePicture={profile?.isNFTProfilePicture}
            size={42}
            source={profilePicSource}
          >
            {abbrNickname}
          </Avatar>
        </Link>

        <VStack flex={2} space={4}>
          <FormControl isInvalid={'message' in errors} isRequired>
            <Stack>
              <Controller
                control={control}
                defaultValue={defaultValue}
                name="message"
                render={({ field: { onChange, value } }) => (
                  <AnimatedTextArea
                    ref={textareaRef}
                    autoCompleteType="off"
                    borderRadius={isCollapsed ? '3xl' : 'md'}
                    fontSize={textAreaFontSize}
                    isReadOnly={isLoading}
                    // maxLength={MAX_CHAR_LIMIT}
                    minW={0}
                    overflow="hidden"
                    placeholder="Not your key, not your tweet. Be web3 native."
                    returnKeyType="done"
                    style={textAreaStyle}
                    textOverflow="ellipsis"
                    totalLines={totalLines}
                    value={value}
                    whiteSpace={isCollapsed ? 'nowrap' : 'normal'}
                    onChangeText={(val) => onChange(handleMessage(val))}
                    onFocus={onFocus}
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

          {image && <ImagePreview image={image} onRemoveImage={() => setImage(undefined)} />}
        </VStack>
      </HStack>

      <Collapse isOpen={!isCollapsed}>
        <HStack alignItems="center" justifyContent="space-between" space={4}>
          <Box w={12} />
          <Tooltip label="Upload Image" openDelay={250}>
            <IconButton
              _icon={iconColor}
              borderRadius="full"
              disabled={isLoading}
              icon={<Icon as={Ionicons} name="image-outline" />}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress={pickImage}
            />
          </Tooltip>

          <HStack alignItems="center" flex={1} space={1}>
            <Switch
              disabled={isLoading}
              size="sm"
              value={isTwitterLoggedIn}
              onToggle={handleTwitterToggle}
            />
            <Text fontWeight="bold">Post on Twitter</Text>
          </HStack>

          <Text color="gray.400" fontSize="xs" ml="auto" textAlign="right">
            {charCount} / {MAX_CHAR_LIMIT}
         </Text>
          <Button
            id="post-tweet-submit-button"
            isLoading={isLoading}
            leftIcon={<Icon as={Ionicons} name="send" size="xs" />}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onPress={handleOnSubmit}
          >
            Submit
          </Button>
        </HStack>
      </Collapse>
    </MessageComposerContainer>
  );
};

// (MessageComposer as any).whyDidYouRender = true;
