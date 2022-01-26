import React, { FC } from 'react';
import { Link, Text, HStack, Box, StatusBar, Flex, Hidden } from 'native-base';
import { LogoIcon, HLogoText } from '@depub/theme';

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
        <Box flex={1}>
          <Hidden from="md">
            <LogoIcon width="42px" />
          </Hidden>
        </Box>

        <Hidden from="base" till="md">
          <Box alignItems="center" flex={1} justifyContent="center">
            <Link href="/">
              <HLogoText height="45px" width="220px" />
            </Link>
          </Box>
        </Hidden>

        <HStack flex={1}>
          {walletAddress ? (
            <Text
              bg="primary"
              borderRadius="full"
              color="white"
              fontSize={{ base: '2xs', md: 'sm' }}
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
