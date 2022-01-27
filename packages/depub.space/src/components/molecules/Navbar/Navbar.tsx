import React, { FC } from 'react';
import { Link, Box, StatusBar, Flex, Hidden } from 'native-base';
import { LogoIcon, HLogoText } from '@depub/theme';

export const Navbar: FC = () => (
  <>
    <StatusBar backgroundColor="#fff" barStyle="dark-content" />

    <Box backgroundColor="#fff" safeAreaTop />

    <Flex
      alignItems="center"
      bg="#fff"
      flexDirection="row"
      h="74px"
      justifyContent="space-between"
      px={{
        base: 4,
        md: 6,
        lg: 8,
      }}
      py={4}
    >
      <Hidden from="md">
        <Box flex={1}>
          <LogoIcon width="42px" />
        </Box>
      </Hidden>

      <Hidden from="base" till="md">
        <Box alignItems="center" flex={1} justifyContent="center">
          <Link href="/">
            <HLogoText height="45px" width="220px" />
          </Link>
        </Box>
      </Hidden>
    </Flex>
  </>
);
