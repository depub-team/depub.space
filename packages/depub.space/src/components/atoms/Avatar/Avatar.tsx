import { Avatar as NBAvatar, IAvatarProps } from 'native-base';
import React, { FC } from 'react';

export interface AvatarProps extends IAvatarProps {
  isNFTProfilePicture?: boolean;
  children?: React.ReactNode;
}

export const Avatar: FC<AvatarProps> = ({ isNFTProfilePicture, children, ...props }) => (
  <NBAvatar
    backgroundColor={props.source ? 'transparent' : 'gray.300'}
    borderRadius={isNFTProfilePicture ? 'none' : 'full'}
    style={
      isNFTProfilePicture
        ? ({
            maskImage: 'url(/images/hex.svg)',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          } as any) // FIXME: type error, cannot use web style here
        : undefined
    }
    {...props}
  >
    {children}
  </NBAvatar>
);
