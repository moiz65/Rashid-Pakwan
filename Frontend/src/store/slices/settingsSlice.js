import { createSlice } from '@reduxjs/toolkit'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    paymentGateways: [],
    shippingMethods: [],
    users: [],
    taxCodes: [],
    deliveryChargeSettings: null,
  },
  reducers: {
    setSettings: (state, action) => {
      state.paymentGateways = action.payload.paymentGateways
      state.shippingMethods = action.payload.shippingMethods
      state.users = action.payload.users
      if (action.payload.taxCodes !== undefined) state.taxCodes = action.payload.taxCodes
      if (action.payload.deliveryChargeSettings !== undefined) {
        state.deliveryChargeSettings = action.payload.deliveryChargeSettings
      }
    },
    setDeliveryChargeSettings: (state, action) => {
      state.deliveryChargeSettings = action.payload
    },
    setTaxCodes: (state, action) => {
      state.taxCodes = action.payload
    },
    addTaxCode: (state, action) => {
      state.taxCodes.push(action.payload)
    },
    updateTaxCode: (state, action) => {
      const idx = state.taxCodes.findIndex((t) => t.id === action.payload.id)
      if (idx !== -1) state.taxCodes[idx] = action.payload
    },
    deleteTaxCode: (state, action) => {
      state.taxCodes = state.taxCodes.filter((t) => t.id !== action.payload)
    },
    togglePaymentGateway: (state, action) => {
      const gw = state.paymentGateways.find((p) => p.id === action.payload)
      if (gw) gw.enabled = !gw.enabled
    },
    addPaymentGateway: (state, action) => {
      state.paymentGateways.unshift(action.payload)
    },
    updatePaymentGateway: (state, action) => {
      const idx = state.paymentGateways.findIndex((p) => p.id === action.payload.id)
      if (idx !== -1) state.paymentGateways[idx] = action.payload
    },
    deletePaymentGateway: (state, action) => {
      state.paymentGateways = state.paymentGateways.filter((p) => p.id !== action.payload)
    },
    addShippingMethod: (state, action) => {
      state.shippingMethods.unshift(action.payload)
    },
    updateShippingMethod: (state, action) => {
      const idx = state.shippingMethods.findIndex((s) => s.id === action.payload.id)
      if (idx !== -1) state.shippingMethods[idx] = action.payload
    },
    deleteShippingMethod: (state, action) => {
      state.shippingMethods = state.shippingMethods.filter((s) => s.id !== action.payload)
    },
    toggleShippingMethod: (state, action) => {
      const sm = state.shippingMethods.find((s) => s.id === action.payload)
      if (sm) sm.enabled = !sm.enabled
    },
    setUsers: (state, action) => {
      state.users = action.payload || []
    },
    addUser: (state, action) => {
      state.users.push(action.payload)
    },
    updateUser: (state, action) => {
      const idx = state.users.findIndex((u) => u.id === action.payload.id)
      if (idx !== -1) state.users[idx] = action.payload
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload)
    },
  },
})

export const {
  setSettings,
  setDeliveryChargeSettings,
  setTaxCodes,
  addTaxCode,
  updateTaxCode,
  deleteTaxCode,
  togglePaymentGateway,
  addPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
  addShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
    toggleShippingMethod,
    setUsers,
    addUser,
    updateUser,
  deleteUser,
} = settingsSlice.actions
export default settingsSlice.reducer
