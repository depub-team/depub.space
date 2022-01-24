import React, { FC } from 'react';
import { Text, HStack, Box, StatusBar, Flex } from 'native-base';
import { LogoIcon } from '../../atoms';

export interface NavbarProps {
  walletAddress?: string;
}

export const Navbar: FC<NavbarProps> = ({ walletAddress }) => {
  const shortenWalletAddress =
    walletAddress && `${walletAddress.slice(0, 10)}...${walletAddress.slice(-4)}`;

  return (
    <>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <Box backgroundColor="#fff" safeAreaTop />

      <Flex
        alignItems="center"
        bg="#fff"
        flexDirection="row"
        justifyContent="space-between"
        minHeight="74px"
        px={{
          base: 4,
          md: 6,
          lg: 8,
        }}
        py={4}
      >
        <Box flex={1} />

        <Box alignItems="center" flex={1} justifyContent="center">
          <LogoIcon width="160px" />
        </Box>

        <HStack flex={1}>
          {walletAddress ? (
            <Text
              bg="black"
              borderRadius="full"
              color="white"
              fontSize="2xs"
              ml="auto"
              px={2}
              py={1}
            >
              {shortenWalletAddress}
            </Text>
          ) : null}
        </HStack>
      </Flex>
    </>
  );
};
