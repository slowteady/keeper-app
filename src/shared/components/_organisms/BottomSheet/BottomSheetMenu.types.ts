export interface BottomSheetMenuData<T> {
  id: T;
  label: string;
}
export interface BottomSheetMenuProps<T> {
  data: BottomSheetMenuData<T>[];
  value: T;
  onPress: (data: BottomSheetMenuData<T>) => void;
}
