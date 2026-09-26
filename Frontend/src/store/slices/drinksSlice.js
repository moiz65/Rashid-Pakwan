import { createSlice } from '@reduxjs/toolkit'

const drinksSlice = createSlice({
  name: 'drinks',
  initialState: { items: [] },
  reducers: {
    setDrinks: (state, action) => {
      state.items = action.payload
    },
    addDrink: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateDrink: (state, action) => {
      const idx = state.items.findIndex((d) => d.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    deleteDrink: (state, action) => {
      state.items = state.items.filter((d) => d.id !== action.payload)
    },
  },
})

export const { setDrinks, addDrink, updateDrink, deleteDrink } = drinksSlice.actions
export default drinksSlice.reducer
