import { copy } from 'copy-anything';

export function deepClone<T>(value: T) {
  return copy(value);
};
