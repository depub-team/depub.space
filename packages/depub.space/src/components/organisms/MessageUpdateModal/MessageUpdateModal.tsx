import React, { ComponentProps, FC } from 'react';
import { Modal, IStackProps } from 'native-base';
import { DesmosProfile } from '../../../interfaces';
import { MessageComposer, MessageFormType } from '../../molecules/MessageComposer';
import { MAX_WIDTH } from '../../../constants';

export interface MessageUpdateModalProps extends IStackProps {
  isLoading?: boolean;
  defaultValue?: string;
  profile: DesmosProfile | null;
  walletAddress: string | null;
  isCollapsed?: boolean;
  autoFocus?: boolean;
  isTwitterLoggedIn?: boolean;
  onFocus?: () => void;
  onTwitterLogin?: () => void;
  onTwitterLogout?: () => void;
  onDelete: () => Promise<void> | void;
  onSubmit?: (data: MessageFormType, image?: string | null) => Promise<void> | void;
}

export type MessageComposerModalProps = ComponentProps<typeof Modal> & MessageUpdateModalProps;

export const MessageUpdateModal: FC<MessageComposerModalProps> = ({
  isLoading,
  defaultValue,
  profile,
  walletAddress,
  isCollapsed,
  isTwitterLoggedIn,
  onFocus,
  onSubmit,
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
        />
      </Modal.Body>
    </Modal.Content>
  </Modal>
);
