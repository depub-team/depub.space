import React from 'react';
import { Entypo } from '@expo/vector-icons';
import { Story } from '@storybook/react';
import { SideMenuItem, SideMenuItemProps } from './SideMenuItem';

export default {
  title: 'SideMenuItem',
  component: SideMenuItem,
};

const Template: Story<SideMenuItemProps> = props => <SideMenuItem {...props} />;

export const Basic = Template.bind({});

Basic.args = {
  children: 'Home',
  icon: Entypo,
  iconName: 'home',
};
