import React, { FC } from 'react';
import { ITextProps, Text } from 'native-base';
import { Platform } from 'react-native';
import { messageSanitizer } from '../../../utils';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

const getInnerHTML = (content: string) => ({ __html: messageSanitizer(content) });

const style: ITextProps = {
  fontFamily: 'text',
  fontSize: { base: 'md', md: 'lg' },
  fontWeight: '500',
  py: 4,
  whiteSpace: 'pre-wrap',
};

export const MessageContent: FC<{ content: string } & ITextProps> = ({ content, ...props }) => (
  <Text {...style} {...props}>
    {Platform.OS === 'web' ? (
      <>
        <style jsx>{`
          .MessageCard__content {
            font-weight: 500;
          }
          .MessageCard__content > :global(a) {
            color: #07d6a0;
          }
        `}</style>
        <div
          className="MessageCard__content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={getInnerHTML(content)}
        />
      </>
    ) : null}
  </Text>
);
