import React, { ComponentProps, FC } from 'react';
import { AspectRatio, IImageProps, Image, Modal } from 'native-base';

export interface ImageModalProps extends ComponentProps<typeof Modal> {
  source: IImageProps['source'];
}

export const ImageModal: FC<ImageModalProps> = ({ source, ...props }) => (
  <Modal {...props}>
    <Modal.Content maxH="100%" maxW="100%" w="90%">
      <Modal.CloseButton />
      <Modal.Body p={0}>
        <AspectRatio ratio={1}>
          <Image flex={1} resizeMode="contain" size="full" source={source} />
        </AspectRatio>
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
