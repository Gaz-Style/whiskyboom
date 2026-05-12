'use client'

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'

export interface CartItem {
  id: string
  slug: string
  name: string
  brand: string
  price: number
  image: string | null
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QTY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.payload }

    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map(i =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        }
      }
      return { ...state, isOpen: true, items: [...state.items, action.payload] }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }

    case 'UPDATE_QTY':
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      }

    case 'CLEAR_CART':
      return { ...state, items: [] }

    case 'OPEN_CART':
      return { ...state, isOpen: true }

    case 'CLOSE_CART':
      return { ...state, isOpen: false }

    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  itemCount: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQty: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'whiskyboom_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false })

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as CartItem[]
        dispatch({ type: 'HYDRATE', payload: items })
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // ignore
    }
  }, [state.items])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, qty = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity: qty } })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }, [])

  const updateQty = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
  const openCart  = useCallback(() => dispatch({ type: 'OPEN_CART' }),  [])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), [])

  const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal  = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items: state.items, isOpen: state.isOpen, itemCount, subtotal, addItem, removeItem, updateQty, clearCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
