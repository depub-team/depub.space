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
  onCheckout: () => void;
}

export const PostedMessageModal: FC<PostedMessageModalProps> = ({
  isOpen,
  twitterUrl,
  onClose,
  onCheckout,
}) => {
  const cancelRef = useRef(null);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialog.Content>
        <AlertDialog.CloseButton />
        <AlertDialog.Header>ISCN Record Created</AlertDialog.Header>
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
              <Text textAlign="center">Your tweet has been created successfully!</Text>
              {twitterUrl && (
                <Text textAlign="center">
                  And also shared on Twitter, Click{' '}
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
            <Button ref={cancelRef} colorScheme="coolGray" variant="unstyled" onPress={onClose}>
              Cancel
            </Button>
            <Button colorScheme="primary" onPress={onCheckout}>
              Checkout
            </Button>
          </Button.Group>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
