import React, { FC, useCallback, useMemo } from 'react';
import {
  Avatar,
  Button,
  HStack,
  Link as NBLink,
  Switch,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from 'native-base';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { HLogoText } from '@depub/theme';
import { SideMenuItem } from './SideMenuItem';
import { HomeScreenNavigationProps } from '../../../screens/HomeScreen';
import { ConnectWalletButton } from '../../atoms/ConnectWalletButton';
import type { DesmosProfile } from '../../../interfaces';
import { getAbbrNickname, getLikecoinAddressByProfile, getShortenAddress } from '../../../utils';

interface MenuItems {
  icon: JSX.Element;
  iconName: string;
  name: string;
  route?: any;
  items?: MenuItems[];
}

const menuItems: MenuItems[] = [
  {
    icon: <Feather />,
    iconName: 'globe',
    name: 'Channels',
    route: {
      screen: 'Channel',
      params: {
        name: 'kungheifatchoy',
      },
    },
  },
];

export interface SideMenuProps extends DrawerContentComponentProps {
  onLogout?: () => void;
  isLoading?: boolean;
  walletAddress: string | null;
  profile: DesmosProfile | null;
}

export const SideMenu: FC<SideMenuProps> = ({
  onLogout,
  isLoading,
  walletAddress,
  profile,
  ...props
}) => {
  const isLogged = Boolean(walletAddress);
  const navigation = useNavigation<HomeScreenNavigationProps>();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const likecoinAddress = profile && getLikecoinAddressByProfile(profile);
  const shortenAddress =
    walletAddress &&
    getShortenAddress(`${walletAddress.slice(0, 10)}...${walletAddress.slice(-4)}`);
  const displayName = profile?.nickname || profile?.dtag || shortenAddress;
  const abbrNickname = getAbbrNickname(displayName || '');
  const profilePicSource = useMemo(
    () => (profile ? { uri: profile.profilePic } : undefined),
    [profile]
  );

  const handleOnConnect = useCallback(() => {
    navigation.navigate('ConnectWallet');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <VStack
        flex={1}
        h="100vh"
        justifyContent="space-between"
        px={{
          base: 4,
          md: 6,
        }}
        py={6}
      >
        <HStack justifyContent="flex-start" pl={4}>
          <NBLink
            _dark={{
              color: 'white',
            }}
            _light={{
              color: 'black',
            }}
            href="/"
          >
            <HLogoText width={190} />
          </NBLink>
        </HStack>
        <VStack mb="auto" mt={{ base: 8, md: 12 }} space={2}>
          {menuItems.map(({ icon, iconName, name, route }) => (
            <SideMenuItem
              key={name}
              icon={icon}
              iconName={iconName}
              onPress={() => {
                if (route) {
                  navigation.navigate(route.screen, route.params);
                }
              }}
            >
              {name}
            </SideMenuItem>
          ))}

          <SideMenuItem
            icon={<MaterialIcons />}
            iconName="nightlight-round"
            onPress={() => toggleColorMode()}
          >
            <HStack alignItems="center" flex={1} justifyContent="space-between">
              <Text fontWeight="bold">Night Mode</Text>
              <Switch isChecked={isDarkMode} size="md" onToggle={() => toggleColorMode()} />
            </HStack>
          </SideMenuItem>
        </VStack>

        {isLogged ? (
          <VStack space={4}>
            <HStack alignItems="center" flex={1} space={3}>
              <Avatar
                borderColor={likecoinAddress ? 'primary.500' : 'gray.200'}
                borderWidth={2}
                size="sm"
                source={profilePicSource}
              >
                {abbrNickname}
              </Avatar>
              <VStack flex={1}>
                <Tooltip label={displayName || ''}>
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
                <Tooltip label={walletAddress || ''}>
                  <Text
                    color="gray.500"
                    flex={1}
                    fontSize="sm"
                    minW={0}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
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
      </VStack>
    </DrawerContentScrollView>
  );
};
