export type PropertiesOf<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
};

export type Flatten<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepFlatten<T> = {
  [K in keyof T]: T[K] extends object ? DeepFlatten<T> : T[K];
} & {};
