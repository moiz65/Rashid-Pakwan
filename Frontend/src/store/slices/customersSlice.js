import { createSlice } from '@reduxjs/toolkit'

const customersSlice = createSlice({
  name: 'customers',
  initialState: { items: [] },
  reducers: {
    setCustomers: (state, action) => {
      state.items = action.payload
    },
    addCustomer: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateCustomer: (state, action) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id)
      if (idx !== -1) state.items[idx] = action.payload
    },
    deleteCustomer: (state, action) => {
      state.items = state.items.filter((c) => c.id !== action.payload)
    },
  },
})

export const { setCustomers, addCustomer, updateCustomer, deleteCustomer } = customersSlice.actions
export default customersSlice.reducer
