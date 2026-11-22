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

