import React, { ComponentProps, FC } from 'react';
import { Modal } from 'native-base';
import { MessageCard } from '../../molecules';
import { Message } from '../../../interfaces';
import { MAX_WIDTH } from '../../../constants';

export interface MessageModalProps extends ComponentProps<typeof Modal> {
  message: Message;
}

export const MessageModal: FC<MessageModalProps> = ({ message, ...props }) => (
  <Modal {...props}>
    <Modal.Content maxH="100%" maxW={MAX_WIDTH} w="95%">
      <Modal.CloseButton />
      <Modal.Body px={0}>
        <MessageCard message={message} />
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
