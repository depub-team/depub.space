import React, { FC, useCallback, useMemo } from 'react';
import {
  Avatar,
  useToast,
  Box,
  Button,
  HStack,
  Link as NBLink,
  ScrollView,
  Switch,
  Text,
  useClipboard,
  Tooltip,
  useColorMode,
  VStack,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { HLogoText } from '@depub/theme';
import { Link } from '@react-navigation/native';
import type { SideMenuItemProps } from './SideMenuItem';
import { SideMenuItem } from './SideMenuItem';
import { ConnectWalletButton } from '../../atoms/ConnectWalletButton';
import type { DesmosProfile } from '../../../interfaces';
import { getAbbrNickname, getLikecoinAddressByProfile, getShortenAddress } from '../../../utils';

export interface SideMenuProps extends DrawerContentComponentProps {
  onLogout?: () => void;
  onConnectWallet?: () => void;
  isLoading?: boolean;
  walletAddress: string | null;
  menuItems: SideMenuItemProps[];
  profile: DesmosProfile | null;
}

const FadeOut: FC<{ direction?: 'up' | 'down' }> = ({ direction = 'up' }) => {
  const isUp = direction === 'up';
  const fadeOutBackground = useMemo(() => {
    const sortDirection = () => (isUp ? 1 : -1);

    return {
      _dark: {
        bg: {
          linearGradient: {
            colors: ['rgba(0,14,33,0)', 'rgba(0,14,33,1)'].sort(sortDirection),
            start: [0, 0],
            end: [0, 1],
          },
        },
      },
      _light: {
        bg: {
          linearGradient: {
            colors: ['rgba(255,255,255,0)', 'rgba(255,255,255,1)'].sort(sortDirection),
            start: [0, 0],
            end: [0, 1],
          },
        },
      },
    };
  }, [isUp]);

  return (
    <Box
      {...fadeOutBackground}
      bottom={isUp ? 0 : undefined}
      h={8}
      left={0}
      pointerEvents="none"
      position="sticky"
      top={!isUp ? 0 : undefined}
      w="100%"
      zIndex={1}
    />
  );
};

export const SideMenu: FC<SideMenuProps> = ({
  onLogout,
  onConnectWallet,
  isLoading,
  walletAddress,
  menuItems,
  profile,
  ...props
}) => {
  const isLogged = Boolean(walletAddress);
  const { colorMode, toggleColorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const toast = useToast();
  const { onCopy } = useClipboard();
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const handle = likecoinAddress && profile?.dtag ? profile.dtag : walletAddress;
  const shortenAddress =
    walletAddress &&
    getShortenAddress(`${walletAddress.slice(0, 10)}...${walletAddress.slice(-4)}`);
  const displayName = profile?.nickname || profile?.dtag || shortenAddress;
  const abbrNickname = getAbbrNickname(displayName || '');
  const profilePicSource = useMemo(
    () => (profile ? { uri: profile.profilePic } : undefined),
    [profile]
  );
  const toUserRoute = useMemo(
    () => ({
      screen: 'User',
      params: {
        account: handle,
      },
    }),
    [handle]
  );

  const copyAddress = useCallback(async () => {
    if (walletAddress) {
      await onCopy(walletAddress);

      toast.show({
        description: 'Copied',
      });
    }
  }, [onCopy, toast, walletAddress]);

  const handleOnConnect = useCallback(() => {
    if (onConnectWallet) onConnectWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DrawerContentScrollView
      contentContainerStyle={{ flex: 1 }}
      style={{ flexBasis: '100vh', flexGrow: 0 }}
      {...props}
    >
      <VStack flex="1 0 100%">
        <HStack justifyContent="flex-start" pt={6} px={{ base: 3, md: 4, lg: 6 }} space={4}>
          <NBLink
            _dark={{
              color: 'white',
            }}
            _light={{
              color: 'black',
            }}
            href="/"
            ml={4}
          >
            <HLogoText height={39} width={190} />
          </NBLink>
        </HStack>

        <ScrollView position="relative">
          <FadeOut direction="down" />
          <VStack flex={1} px={{ base: 3, md: 4, lg: 6 }} space={1}>
            {menuItems.map(menuItemProps => (
              <SideMenuItem key={menuItemProps.name} {...menuItemProps} />
            ))}

            <SideMenuItem
              icon={<MaterialIcons />}
              iconName="nightlight-round"
              onPress={toggleColorMode}
            >
              <HStack alignItems="center" flex={1} justifyContent="space-between">
                <Text fontWeight="bold">Night Mode</Text>
                <Switch isChecked={isDarkMode} size="md" onToggle={toggleColorMode} />
              </HStack>
            </SideMenuItem>
          </VStack>
          <FadeOut />
        </ScrollView>

        <Box
          px={{ base: 3, md: 4, lg: 6 }}
          py={{
            base: 6,
            lg: 8,
          }}
        >
          {isLogged ? (
            <VStack space={4}>
              <HStack alignItems="center" flex={1} space={3}>
                <Link to={toUserRoute}>
                  <Avatar
                    borderColor={likecoinAddress ? 'primary.500' : 'gray.200'}
                    borderWidth={2}
                    size="sm"
                    source={profilePicSource}
                  >
                    {abbrNickname}
                  </Avatar>
                </Link>
                <VStack flex={1}>
                  <Link to={toUserRoute}>
                    <Tooltip label={displayName || ''} openDelay={250}>
                      <Text
                        flex={1}
                        fontSize="sm"
                        fontWeight="bold"
                        minW={0}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {displayName}
                      </Text>
                    </Tooltip>
                  </Link>

                  <Tooltip label="Click to copy the wallet address" openDelay={250}>
                    <Text
                      color="gray.500"
                      flex={1}
                      fontSize="sm"
                      minW={0}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      onPress={copyAddress}
                    >
                      {walletAddress}
                    </Text>
                  </Tooltip>
                </VStack>
              </HStack>

              <Button variant="outline" onPress={onLogout}>
                Logout
              </Button>
            </VStack>
          ) : (
            <ConnectWalletButton isLoading={isLoading} onPress={handleOnConnect} />
          )}
        </Box>
      </VStack>
    </DrawerContentScrollView>
  );
};
