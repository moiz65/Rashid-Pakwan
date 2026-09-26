import * as reviewService from '../services/review.service.js'
import { sendSuccess } from '../utils/response.js'

function wrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res)
    } catch (err) {
      next(err)
    }
  }
}

export const listReviews = wrap(async (req, res) => {
  sendSuccess(res, { reviews: await reviewService.listOrderReviews(req.query) })
})

export const getPublicReviews = wrap(async (req, res) => {
  sendSuccess(res, await reviewService.getPublicReviews(req.query))
})

export const updateReview = wrap(async (req, res) => {
  sendSuccess(res, { review: await reviewService.updateOrderReview(req.params.id, req.body) })
})

export const removeReview = wrap(async (req, res) => {
  sendSuccess(res, await reviewService.removeOrderReview(req.params.id))
})

export const getPublicReviewEligibility = wrap(async (req, res) => {
  sendSuccess(res, await reviewService.getPublicReviewEligibility(req.params.id, req.query.phone))
})

export const submitPublicReview = wrap(async (req, res) => {
  sendSuccess(
    res,
    { review: await reviewService.submitPublicReview(req.params.id, req.query.phone, req.body) },
    201
  )
})

export const getReviewSettings = wrap(async (_req, res) => {
  sendSuccess(res, { settings: await reviewService.getReviewSettings() })
})

export const updateReviewSettings = wrap(async (req, res) => {
  sendSuccess(res, { settings: await reviewService.updateReviewSettings(req.body) })
})
