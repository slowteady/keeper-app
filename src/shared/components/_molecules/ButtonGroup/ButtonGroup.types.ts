export interface ButtonGroupProps<T> {
  id: T;
  data: ButtonGroupData<T>[];
  onChange: (id: T) => void;
}
export interface ButtonGroupData<T> {
  id: T;
  label: string;
}
