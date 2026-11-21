// storage.ts — every localStorage key the shop uses, under one prefix
export type StorageKey = 'siraj-shop:cart' | 'siraj-shop:dark'

export const STORAGE = {
  cart: 'siraj-shop:cart',
  dark: 'siraj-shop:dark',
} as const satisfies { [name: string]: StorageKey }
