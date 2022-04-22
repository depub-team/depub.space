import { extendTheme, theme as nbTheme } from 'native-base';
import { Ionicons } from '@expo/vector-icons';

export * from './components';

export const PRIMARY_COLOR = '#07d6a0';

export const theme = extendTheme({
  useSystemColorMode: true,
  initialColorMode: 'dark',

  // generated by https://angular-md-color.com/#/
  colors: {
    primary: {
      50: '#63fad2',
      100: '#4af9cb',
      200: '#31f8c4',
      300: '#19f7bd',
      400: '#08efb2',
      500: '#07d6a0',
      600: '#06bd8e',
      700: '#05a57b',
      800: '#058c69',
      900: '#047356',
    },
  },
  fonts: {
    body: '"Montserrat", sans-serif',
    heading: 'Montserrat_bold, sans-serif',
    text: 'Montserrat_medium, sans-serif',
    monospace: 'Courier, Monaco, monospace',
  },
  shadows: {
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.07,
      shadowRadius: 6.27,
      elevation: 10,
    },
    dark: {
      shadowColor: nbTheme.colors.darkBlue['900'],
      shadowOffset: {
        width: 0,
        height: 22,
      },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 10,
    },
    light: {
      shadowColor: '#fff',
      shadowOffset: {
        width: 0,
        height: 22,
      },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 10,
    },
  },
  components: {
    Text: {
      baseStyle: {
        fontSize: 'md',
      },
    },
    Checkbox: {
      baseStyle: {
        _text: {
          fontSize: 'md',
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: 'sm',
        paddingTop: 3,
        paddingBottom: 3,
        _text: {
          fontWeight: 'bold',
        },
      },
      defaultProps: {
        size: 'md',
      },
    },
    Input: {
      defaultProps: {
        size: 'sm',
        fontSize: 'md',
      },
    },
    TextArea: {
      defaultProps: {
        size: 'sm',
        fontSize: 'md',
      },
    },
    Heading: {
      baseStyle: {
        color: 'primary.500',
      },
    },
    ModalContent: {
      baseStyle: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.07)',
        _light: {
          bg: 'white',
        },
        _dark: {
          bg: '#000e21',
        },
      },
    },
    ModalCloseButton: {
      baseStyle: {
        _icon: {
          as: Ionicons,
          borderRadius: 'full',
          color: 'white',
          name: 'close',
          size: 'xs',
        },
        _hover: {
          bg: 'gray.900:alpha.100',
        },
        _focusVisible: {
          bg: 'gray.900:alpha.100',
        },
        _pressed: {
          bg: 'gray.900:alpha.100',
        },
        bg: 'gray.900:alpha.50',
        borderRadius: 'full',
        p: 1,
        variant: 'unstyled',
      },
    },
  },
  config: {
    // Changing initialColorMode to 'dark'
    initialColorMode: 'light',
  },
});
