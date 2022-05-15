import React, { ComponentProps, FC } from 'react';
import { Modal } from 'native-base';
import { MessageComposer, MessageComposerProps } from '../../molecules/MessageComposer';
import { MAX_WIDTH } from '../../../constants';

export type MessageComposerModalProps = ComponentProps<typeof Modal> & MessageComposerProps;

export const MessageComposerModal: FC<MessageComposerModalProps> = ({
  isLoading,
  defaultValue,
  profile,
  walletAddress,
  isCollapsed,
  isTwitterLoggedIn,
  onFocus,
  onSubmit,
  onTwitterLogin,
  onTwitterLogout,
  ...modalProps
}) => (
  <Modal closeOnOverlayClick={!isLoading} {...modalProps}>
    <Modal.Content maxH="100%" maxW={MAX_WIDTH} w="95%">
      <Modal.Body px={0}>
        <MessageComposer
          autoFocus={modalProps.isOpen}
          defaultValue={defaultValue}
          isCollapsed={isCollapsed}
          isLoading={isLoading}
          isTwitterLoggedIn={isTwitterLoggedIn}
          profile={profile}
          walletAddress={walletAddress}
          onFocus={onFocus}
          onSubmit={onSubmit}
          onTwitterLogin={onTwitterLogin}
          onTwitterLogout={onTwitterLogout}
        />
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
