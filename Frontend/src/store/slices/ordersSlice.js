import { createSlice } from '@reduxjs/toolkit'

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [] },
  reducers: {
    setOrders: (state, action) => {
      state.items = action.payload
    },
    addOrder: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateOrderStatus: (state, action) => {
      const { id, status, rejectionReason } = action.payload
      const order = state.items.find((o) => o.id === id)
      if (order) {
        order.status = status
        if (rejectionReason !== undefined) {
          order.rejectionReason = rejectionReason
        }
        if (!['rejected', 'cancelled'].includes(status)) {
          order.rejectionReason = null
        }
      }
    },
    deleteOrder: (state, action) => {
      state.items = state.items.filter((o) => o.id !== action.payload)
    },
  },
})

export const { setOrders, addOrder, updateOrderStatus, deleteOrder } = ordersSlice.actions
export default ordersSlice.reducer
