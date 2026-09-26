import { createSlice } from '@reduxjs/toolkit'

const marketingSlice = createSlice({
  name: 'marketing',
  initialState: { coupons: [], discounts: [], offers: [], deals: [] },
  reducers: {
    setMarketing: (state, action) => {
      state.coupons = action.payload.coupons ?? state.coupons
      state.discounts = action.payload.discounts ?? state.discounts
      state.offers = action.payload.offers ?? state.offers
      state.deals = action.payload.deals ?? state.deals
    },
    setCoupons: (state, action) => {
      state.coupons = action.payload
    },
    setDiscounts: (state, action) => {
      state.discounts = action.payload
    },
    setOffers: (state, action) => {
      state.offers = action.payload
    },
    setDeals: (state, action) => {
      state.deals = action.payload
    },
    addCoupon: (state, action) => {
      state.coupons.unshift(action.payload)
    },
    updateCoupon: (state, action) => {
      const idx = state.coupons.findIndex((c) => c.id === action.payload.id)
      if (idx !== -1) state.coupons[idx] = action.payload
    },
    deleteCoupon: (state, action) => {
      state.coupons = state.coupons.filter((c) => c.id !== action.payload)
    },
    addDiscount: (state, action) => {
      state.discounts.unshift(action.payload)
    },
    updateDiscount: (state, action) => {
      const idx = state.discounts.findIndex((d) => d.id === action.payload.id)
      if (idx !== -1) state.discounts[idx] = action.payload
    },
    deleteDiscount: (state, action) => {
      state.discounts = state.discounts.filter((d) => d.id !== action.payload)
    },
    addOffer: (state, action) => {
      state.offers.unshift(action.payload)
    },
    updateOffer: (state, action) => {
      const idx = state.offers.findIndex((o) => o.id === action.payload.id)
      if (idx !== -1) state.offers[idx] = action.payload
    },
    deleteOffer: (state, action) => {
      state.offers = state.offers.filter((o) => o.id !== action.payload)
    },
    addDeal: (state, action) => {
      state.deals.unshift(action.payload)
    },
    updateDeal: (state, action) => {
      const idx = state.deals.findIndex((d) => d.id === action.payload.id)
      if (idx !== -1) state.deals[idx] = action.payload
    },
    deleteDeal: (state, action) => {
      state.deals = state.deals.filter((d) => d.id !== action.payload)
    },
  },
})

export const {
  setMarketing,
  setCoupons,
  setDiscounts,
  setOffers,
  setDeals,
  addCoupon, updateCoupon, deleteCoupon,
  addDiscount, updateDiscount, deleteDiscount,
  addOffer, updateOffer, deleteOffer,
  addDeal, updateDeal, deleteDeal,
} = marketingSlice.actions
export default marketingSlice.reducer
