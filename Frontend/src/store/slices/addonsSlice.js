import { createSlice } from '@reduxjs/toolkit'

const addonsSlice = createSlice({
  name: 'addons',
  initialState: { items: [] },
  reducers: {
    setAddons: (state, action) => {
      state.items = action.payload
    },
    addAddon: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateAddon: (state, action) => {
      const idx = state.items.findIndex((a) => a.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    deleteAddon: (state, action) => {
      state.items = state.items.filter((a) => a.id !== action.payload)
    },
  },
})

export const { setAddons, addAddon, updateAddon, deleteAddon } = addonsSlice.actions
export default addonsSlice.reducer
