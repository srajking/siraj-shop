// cartReducer.js — every rule of the cart, in one pure function
export function cartReducer(cart, action) {
  switch (action.type) {
    case 'added': {
      const q = Math.min((cart[action.id] ?? 0) + action.n, action.stock)
      return { ...cart, [action.id]: q }
    }
    case 'decreased': {
      const q = (cart[action.id] ?? 0) - 1
      if (q <= 0) {
        const { [action.id]: _, ...rest } = cart
        return rest
      }
      return { ...cart, [action.id]: q }
    }
    case 'cleared':
      return {}
    default:
      throw Error('Unknown action: ' + action.type)
  }
}
