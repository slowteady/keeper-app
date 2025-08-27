import { YStackProps } from 'tamagui';

export interface SafeScreenProps extends YStackProps {
  children: React.ReactNode;
  /**
   * SafeArea 사용 여부
   */
  useSafeArea?: boolean;
  /**
   * SafeArea 상단 사용 여부
   */
  isSafeTop?: boolean;
  /**
   * SafeArea 하단 사용 여부
   */
  isSafeBottom?: boolean;
  /**
   * SafeArea 상단 패딩
   */
  customTopPadding?: number;
  /**
   * SafeArea 하단 패딩
   */
  customBottomPadding?: number;
}
