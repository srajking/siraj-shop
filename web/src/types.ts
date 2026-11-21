// types.ts — the shop's shapes, named once and imported everywhere
export interface Product {
  id: number
  name: string
  desc: string
  price: number                                                // IQD
  stock: number
  img: string                                                  // public/img/<img>-400.jpg
  alt: string
}

export type Cart = { [id: number]: number }                    // productId → qty

export type CartAction =                                       // one shape per type
  | { type: 'added'; id: number; n: number; stock: number }
  | { type: 'decreased'; id: number }
  | { type: 'cleared' }
