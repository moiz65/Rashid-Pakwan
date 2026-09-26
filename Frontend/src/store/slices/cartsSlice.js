import { createSlice } from '@reduxjs/toolkit'

const cartsSlice = createSlice({
  name: 'carts',
  initialState: { items: [] },
  reducers: {
    setCarts: (state, action) => {
      state.items = action.payload
    },
    markCartRecovered: (state, action) => {
      state.items = state.items.filter((c) => c.id !== action.payload)
    },
    deleteCart: (state, action) => {
      state.items = state.items.filter((c) => c.id !== action.payload)
    },
  },
})

export const { setCarts, markCartRecovered, deleteCart } = cartsSlice.actions
export default cartsSlice.reducer
