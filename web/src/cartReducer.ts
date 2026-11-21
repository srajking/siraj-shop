// cartReducer.ts — every rule of the cart, in one pure function
import type { Cart, CartAction } from './types.ts'

export function cartReducer(
  cart: Cart,
  action: CartAction,
): Cart {
  switch (action.type) {
    case 'added': {
      const { id, n, stock } = action                          // all three: checked by the type
      return { ...cart, [id]: Math.min((cart[id] ?? 0) + n, stock) }
    }
    case 'decreased': {
      const { id } = action
      const q = (cart[id] ?? 0) - 1
      if (q <= 0) {
        const { [id]: _, ...rest } = cart
        return rest
      }
      return { ...cart, [id]: q }
    }
    case 'cleared':
      return {}
    default: {
      const unknown: never = action                            // a new type stops the build here
      throw Error('Unknown action: ' + (unknown as CartAction).type)
    }
  }
}
