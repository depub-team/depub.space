import React, { useState, ComponentProps, FC } from 'react';
import {
  Button,
  FormControl,
  Input,
  Icon,
  Text,
  Modal,
  VStack,
  WarningOutlineIcon,
} from 'native-base';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface TipsModalProps extends ComponentProps<typeof Modal> {
  nickname: string;
  senderAddress: string | null;
  recipientAddress: string;
  onSubmit: (amount: number) => Promise<void>;
}

export const TipsModal: FC<TipsModalProps> = ({
  senderAddress,
  recipientAddress,
  nickname,
  onSubmit,
  onClose,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = Yup.object().shape({
    amount: Yup.number().required().min(5),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      amount: '5',
    },
  });
  const handleOnSubmit = async (data: { amount: string }) => {
    setIsLoading(true);

    await onSubmit(parseFloat(data.amount));

    setIsLoading(false);

    onClose();
  };

  return (
    <Modal {...props}>
      <Modal.Content maxH="100%" maxW={380} w="100%">
        <Modal.CloseButton />
        <Modal.Body p={8}>
          <VStack alignItems="center" justifyContent="center" space={4}>
            <Text fontSize="lg">
              Send tips to{' '}
              <Text color="primary.500" fontWeight="bold">
                {nickname}
              </Text>
            </Text>
            <Text color="gray.500" fontSize="sm">
              {recipientAddress}
            </Text>

            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormControl isInvalid={Boolean(errors.amount)}>
                  <FormControl.Label>Amount ($LIKE)</FormControl.Label>

                  <Input
                    isDisabled={isLoading}
                    keyboardType="numeric"
                    placeholder="LIKE"
                    type="text"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={val => onChange(val)}
                  />
                  {errors.amount && (
                    <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />} w="100%">
                      Must be greater or equal to 5 LIKE
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>
              )}
              rules={{
                required: true,
              }}
            />

            {senderAddress ? (
              <Button
                isLoading={isLoading}
                isLoadingText="Sending..."
                leftIcon={
                  <Icon as={<MaterialCommunityIcons name="bank-transfer-out" />} size="sm" />
                }
                w="100%"
                onPress={handleSubmit(handleOnSubmit)}
              >
                Send
              </Button>
            ) : (
              <Button
                isLoading={isLoading}
                isLoadingText="Connecting..."
                leftIcon={
                  <Icon as={<MaterialCommunityIcons name="bank-transfer-out" />} size="sm" />
                }
                w="100%"
                onPress={handleSubmit(handleOnSubmit)}
              >
                Send
              </Button>
            )}
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};
