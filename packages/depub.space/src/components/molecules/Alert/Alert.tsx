import {
  Alert as NBAlert,
  IAlertProps,
  Box,
  CloseIcon,
  HStack,
  Text,
  IconButton,
  Slide,
  VStack,
  ISlideProps,
} from 'native-base';
import React, { FC } from 'react';

export interface AlertProps extends IAlertProps {
  title: string;
  content?: string;
  slideInDurantion?: number; // alert duration
  placement?: ISlideProps['placement'];
  onClose?: () => void;
}

export const Alert: FC<AlertProps> = ({
  title,
  content,
  placement = 'top',
  status = 'info',
  slideInDurantion = 500,
  onClose,
  ...props
}) => (
  <Slide duration={slideInDurantion} in placement={placement}>
    <NBAlert status={status} w="100%" {...props}>
      <VStack flexShrink={1} space={2} w="100%">
        <HStack alignItems="center" flexShrink={1} justifyContent="space-between" space={2}>
          <HStack alignItems="center" flexShrink={1} space={2}>
            <NBAlert.Icon />
            <Text color="coolGray.800" fontSize="md" fontWeight="medium">
              {title}
            </Text>
          </HStack>
          <IconButton
            icon={<CloseIcon color="coolGray.600" size="3" />}
            variant="unstyled"
            onPress={onClose}
          />
        </HStack>
        {content && (
          <Box
            _text={{
              color: 'coolGray.600',
            }}
            pl="6"
          >
            {content}
          </Box>
        )}
      </VStack>
    </NBAlert>
  </Slide>
);
