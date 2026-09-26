import { createSlice } from '@reduxjs/toolkit'

const brandsSlice = createSlice({
  name: 'brands',
  initialState: { items: [] },
  reducers: {
    setBrands: (state, action) => {
      state.items = action.payload
    },
    addBrand: (state, action) => {
      state.items.push(action.payload)
    },
    updateBrand: (state, action) => {
      const idx = state.items.findIndex((b) => b.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    deleteBrand: (state, action) => {
      state.items = state.items.filter((b) => b.id !== action.payload)
    },
  },
})

export const { setBrands, addBrand, updateBrand, deleteBrand } = brandsSlice.actions
export default brandsSlice.reducer
