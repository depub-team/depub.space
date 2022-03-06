import React from 'react';
import { Story } from '@storybook/react';
import { SideMenu } from './SideMenu';

export default {
  title: 'SideMenu',
  component: SideMenu,
};

const Template: Story<any> = props => <SideMenu {...props} />;

export const Basic = Template.bind({});

Basic.args = {};
