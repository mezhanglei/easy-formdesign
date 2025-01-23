type FilterPath<P> = P extends '' ? undefined : P;
export type PathHead<Path> = Path extends `[${number}].${string}`
  ? number
  : Path extends `[${number}]${string}`
  ? number
  : Path extends `${infer R}.${string}`
  ? R
  : Path;
export type PathRest<Path> = Path extends `[${number}].${infer R}`
  ? FilterPath<R>
  : Path extends `[${number}]${infer R}`
  ? FilterPath<R>
  : Path extends `${string}.${infer R}`
  ? FilterPath<R>
  : undefined;
// 路径映射到目标值
export type PathValue<T, Path> = FilterPath<Path> extends undefined
  ? T
  : PathHead<Path> extends keyof T
  ? PathRest<Path> extends string
  ? PathValue<T[PathHead<Path>], PathRest<Path>>
  : T[PathHead<Path>]
  : undefined;

export type GetMapValueType<T extends Map<unknown, unknown>> = T extends Map<unknown, infer V> ? V : never;
