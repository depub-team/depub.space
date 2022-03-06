import React from 'react';
import { Story } from '@storybook/react';
import { MessageComposer, MessageComposerProps } from './MessageComposer';

export default {
  title: 'Molecules/MessageComposer',
  component: MessageComposer,
};

const Template: Story<MessageComposerProps> = props => <MessageComposer {...props} />;

export const Basic = Template.bind({});

Basic.args = {
  address: 'cosmos1abcdefghijklmn',
  profile: null,
};
