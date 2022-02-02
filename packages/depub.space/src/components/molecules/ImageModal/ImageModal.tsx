import React, { ComponentProps, FC } from 'react';
import { AspectRatio, IImageProps, Image, Modal } from 'native-base';

export interface ImageModalProps extends ComponentProps<typeof Modal> {
  source: IImageProps['source'];
  aspectRatio: number;
}

export const ImageModal: FC<ImageModalProps> = ({ source, aspectRatio = 1, ...props }) => (
  <Modal {...props}>
    <Modal.Content maxH="100%" maxW={1000} w="90%">
      <Modal.CloseButton />
      <Modal.Body p={0}>
        <AspectRatio ratio={aspectRatio}>
          <Image flex={1} size="full" source={source} />
        </AspectRatio>
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
