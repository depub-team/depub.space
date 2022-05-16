import {
  Button,
  AlertDialog,
  Text,
  Icon,
  Center,
  Link,
  VStack,
  PresenceTransition,
} from 'native-base';
import React, { useRef, FC } from 'react';
import { Feather } from '@expo/vector-icons';

export interface PostedMessageModalProps {
  twitterUrl?: string;
  isOpen?: boolean;
  onClose: () => void;
  onOk: () => void;
}

export const PostedMessageModal: FC<PostedMessageModalProps> = ({
  isOpen,
  twitterUrl,
  onClose,
  onOk,
}) => {
  const cancelRef = useRef(null);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialog.Content>
        <AlertDialog.CloseButton />
        <AlertDialog.Header>Tweeted</AlertDialog.Header>
        <AlertDialog.Body>
          <Center>
            <VStack alignItems="center" justifyContent="center" py={4} space={4}>
              <PresenceTransition
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 250,
                  },
                }}
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                visible={isOpen}
              >
                <Icon as={<Feather />} color="emerald.500" mt="2" name="check-circle" size="xl" />
              </PresenceTransition>

              <Text textAlign="center">Your tweet is registered as NFT.</Text>
              {twitterUrl && (
                <Text textAlign="center">
                  The tweet is simultaneously shared on Twitter.{' '}
                  <Link href={twitterUrl} isExternal>
                    here to open
                  </Link>
                </Text>
              )}
            </VStack>
          </Center>
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button.Group space={2}>
            <Button ref={cancelRef} colorScheme="primary" onPress={onOk}>
              OK
            </Button>
          </Button.Group>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
