import { PagerViewProps } from 'react-native-pager-view';

export interface BasicCarouselProps extends PagerViewProps {
  data: string[];
  onChange?: (data: string) => void;
  showIndicator?: boolean;
  showImageViewer?: boolean;
}
