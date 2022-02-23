import React, { ComponentProps, FC } from 'react';
import {
  Modal,
  VStack,
  Input,
  Heading,
  useClipboard,
  Pressable,
  useToast,
  Tooltip,
} from 'native-base';
import { MAX_WIDTH } from '../../../contants';

export interface ShareModalProps extends ComponentProps<typeof Modal> {
  url: string;
}

export const ShareModal: FC<ShareModalProps> = ({ url, ...props }) => {
  const { onCopy } = useClipboard();
  const toast = useToast();

  const handleOnPress = async () => {
    await onCopy(url);

    toast.show({
      title: 'The URL has been copied to clipboard!',
      status: 'success',
      placement: 'top',
    });
  };

  return (
    <Modal {...props}>
      <Modal.Content maxH="100%" maxW={MAX_WIDTH} w="100%">
        <Modal.CloseButton />
        <Modal.Body pr={8} pt={8}>
          <VStack space={4}>
            <Heading color="black" fontSize="xl">
              Share
            </Heading>

            <Tooltip label="Click to copy the URL" openDelay={250}>
              <Pressable onPress={() => handleOnPress()}>
                <Input isDisabled value={url} />
              </Pressable>
            </Tooltip>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};
