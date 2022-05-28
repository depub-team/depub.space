import React, { ComponentProps, FC } from 'react';
import { Modal, Text, View } from 'native-base';
import { MessageCard } from '../../molecules';
import { Message } from '../../../interfaces';
import { MAX_WIDTH } from '../../../constants';

export interface MessageModalProps extends ComponentProps<typeof Modal> {
  message: Message;
}

const MessageContent: FC<MessageModalProps> = ({ message }) => {
  const isDeleted = message.isDeleted || false

  if (isDeleted) {

    return (
      
      <View px={{ base: 4, md: 8 }} py={{ base: 8, md: 12 }}>
        <Text style={{textAlign: "center"}} >This tweet is removed from depub.SPACE frontend by the author.</Text>
      </View>
    )
  }

  return <MessageCard message={message} />
}

export const MessageModal: FC<MessageModalProps> = ({ message, ...props }) => (
  <Modal {...props}>
    <Modal.Content maxH="100%" maxW={MAX_WIDTH} w="95%">
      <Modal.CloseButton />
      <Modal.Body px={0}>
        <MessageContent message={message} />
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
