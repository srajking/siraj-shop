// storage.ts — every localStorage key the shop uses, under one prefix
export const STORAGE = {
  cart: 'siraj-shop:cart',
  dark: 'siraj-shop:dark',
} as const satisfies { [name: string]: `siraj-shop:${string}` }

export type StorageKey = (typeof STORAGE)[keyof typeof STORAGE]   // read from the object
