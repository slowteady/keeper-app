import { StyleSheet } from 'react-native';

const theme = {
  hairline: StyleSheet.hairlineWidth,
  colors: {
    white: {
      600: '#D3D9D5',
      800: '#E9ECEA',
      900: '#FFF'
    },
    black: {
      500: '#ADB3AF',
      600: '#868B88',
      700: '#3F403F',
      800: '#222423',
      900: '#161717'
    },
    primary: {
      main: '#1FE678',
      dark: '#15BC60',
      lightest: '#30e582'
    },
    error: {
      main: '#FF4C47',
      light: '#FFD7D6',
      lightest: '#FFD7D6'
    },
    success: {
      main: '#0A7FFF',
      lightest: '#CFE6FF'
    },
    background: {
      default: '#F3F4F4'
    }
  }
};

export default theme;
