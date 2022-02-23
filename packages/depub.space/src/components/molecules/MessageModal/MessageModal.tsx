import React, { ComponentProps, FC } from 'react';
import { Modal } from 'native-base';
import { MessageCard } from '../MessageCard';
import { Message } from '../../../interfaces';
import { MAX_WIDTH } from '../../../contants';

export interface MessageModalProps extends ComponentProps<typeof Modal> {
  message: Message;
}

export const MessageModal: FC<MessageModalProps> = ({ message, ...props }) => (
  <Modal {...props}>
    <Modal.Content maxH="100%" maxW={MAX_WIDTH} w="100%">
      <Modal.CloseButton />
      <Modal.Body pr={8} pt={8}>
        <MessageCard message={message} />
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
