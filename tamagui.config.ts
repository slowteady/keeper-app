import { defaultConfig } from '@tamagui/config/v4';
import { createFont, createTamagui } from 'tamagui';

const bodyFont = createFont({
  family: 'Pretendard',
  weight: {
    1: '100',
    2: '200',
    3: '300',
    4: '400',
    5: '500',
    6: '600',
    7: '700',
    8: '800',
    9: '900',
    b: 'bold'
  },
  face: {
    400: { normal: 'Pretendard-Regular' },
    500: { normal: 'Pretendard-Medium' },
    600: { normal: 'Pretendard-SemiBold' },
    700: { normal: 'Pretendard-Bold' }
  },
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 24,
    7: 28
  },
  lineHeight: {
    1: 16,
    2: 18,
    3: 20,
    4: 22,
    5: 24,
    6: 28,
    7: 32
  }
});

export const config = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    color: {
      pageBackground: '#FFFFFF',
      backgroundDefault: '#F3F4F4',
      white600: '#D3D9D5',
      white700: '#E7E7E7',
      white800: '#E9ECEA',
      white850: '#F7F7F7',
      white900: '#FFF',
      blackMain: '#000000',
      black400: '#C1C4C2',
      black500: '#ADB3AF',
      black600: '#868B88',
      black650: '#707070',
      black700: '#3F403F',
      black800: '#222423',
      black900: '#161717',
      primaryMain: '#1FE678',
      primaryDark: '#15BC60',
      primaryLightest: '#30e582',
      errorMain: '#FF4C47',
      errorLight: '#FFD7D6',
      errorLightest: '#FFD7D6',
      successMain: '#0A7FFF',
      successLightest: '#CFE6FF',
      noticeMain: '#FFB800',
      noticeLightest: '#FFF5DB',
      dogMain: '#F97316',
      dogLightest: '#FFEDD5',
      catMain: '#8B5CF6',
      catLightest: '#EDE9FE',
      etcMain: '#0891B2',
      etcLightest: '#CFFAFE'
    },
    radius: {
      ...defaultConfig.tokens.radius,
      0: 0,
      1: 2,
      2: 4,
      3: 6,
      4: 8,
      5: 10,
      6: 12,
      7: 14,
      8: 16,
      9: 18
    },
    space: {
      ...defaultConfig.tokens.space,
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36
    }
  },
  fonts: {
    ...defaultConfig.fonts,
    body: bodyFont
  },
  themes: {
    light: {
      ...defaultConfig.themes.light,

      pageBackground: '#FFFFFF',
      backgroundDefault: '#F3F4F4',
      color: '#161717',

      white600: '#D3D9D5',
      white700: '#E7E7E7',
      white800: '#E9ECEA',
      white850: '#F7F7F7',
      white900: '#FFFFFF',

      blackMain: '#000000',
      black300: '#707070',
      black400: '#C1C4C2',
      black500: '#ADB3AF',
      black600: '#868B88',
      black650: '#707070',
      black700: '#3F403F',
      black800: '#222423',
      black900: '#161717',

      primaryMain: '#1FE678',
      primaryDark: '#15BC60',
      primaryLightest: '#30e582',

      errorMain: '#FF4C47',
      errorLight: '#FFD7D6',
      errorLightest: '#FFD7D6',

      successMain: '#0A7FFF',
      successLightest: '#CFE6FF',

      noticeMain: '#FFB800',
      noticeLightest: '#FFF5DB',
      dogMain: '#F97316',
      dogLightest: '#FFEDD5',
      catMain: '#8B5CF6',
      catLightest: '#EDE9FE',
      etcMain: '#0891B2',
      etcLightest: '#CFFAFE'
    }
  }
});

export type CustomConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends CustomConfig {}
}
