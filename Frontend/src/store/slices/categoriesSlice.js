import { createSlice } from '@reduxjs/toolkit'

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [] },
  reducers: {
    setCategories: (state, action) => {
      state.items = action.payload
    },
    addCategory: (state, action) => {
      state.items.push(action.payload)
    },
    updateCategory: (state, action) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    deleteCategory: (state, action) => {
      state.items = state.items.filter((c) => c.id !== action.payload)
    },
  },
})

export const { setCategories, addCategory, updateCategory, deleteCategory } = categoriesSlice.actions
export default categoriesSlice.reducer
