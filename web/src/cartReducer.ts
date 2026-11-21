// cartReducer.ts — every rule of the cart, in one pure function
import type { Cart, CartAction } from './types.ts'

function missing(field: string): never {                       // never returns
  throw Error('cart action is missing ' + field)
}

export function cartReducer(
  cart: Cart,
  action: CartAction,
): Cart {
  switch (action.type) {
    case 'added': {
      const id = action.id ?? missing('id')
      const n = action.n ?? missing('n')
      const stock = action.stock ?? missing('stock')
      return { ...cart, [id]: Math.min((cart[id] ?? 0) + n, stock) }
    }
    case 'decreased': {
      const id = action.id ?? missing('id')
      const q = (cart[id] ?? 0) - 1
      if (q <= 0) {
        const { [id]: _, ...rest } = cart
        return rest
      }
      return { ...cart, [id]: q }
    }
    case 'cleared':
      return {}
    default:
      throw Error('Unknown action: ' + action.type)
  }
}
