export interface BottomSheetMenuData<T> {
  value: T;
  name: string;
}
export interface BottomSheetMenuProps<T> {
  data: BottomSheetMenuData<T>[];
  value: T;
  onPress: (data: BottomSheetMenuData<T>) => void;
}
