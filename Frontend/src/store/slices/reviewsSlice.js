import { createSlice } from '@reduxjs/toolkit'

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: { items: [] },
  reducers: {
    setReviews: (state, action) => {
      state.items = action.payload
    },
    updateReviewStatus: (state, action) => {
      const { id, status } = action.payload
      const review = state.items.find((r) => r.id === id)
      if (review) review.status = status
    },
    deleteReview: (state, action) => {
      state.items = state.items.filter((r) => r.id !== action.payload)
    },
  },
})

export const { setReviews, updateReviewStatus, deleteReview } = reviewsSlice.actions
export default reviewsSlice.reducer
