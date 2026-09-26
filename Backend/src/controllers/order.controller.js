import * as orderService from '../services/order.service.js'
import { sendSuccess } from '../utils/response.js'

export async function list(req, res, next) {
  try {
    const orders = await orderService.listOrders(req.query)
    sendSuccess(res, { orders })
  } catch (err) {
    next(err)
  }
}

export async function getById(req, res, next) {
  try {
    const order = await orderService.getOrder(req.params.id)
    sendSuccess(res, { order })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const order = await orderService.createOrder(req.body)
    sendSuccess(res, { order }, 201)
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, rejectionReason } = req.body
    const order = await orderService.updateOrderStatus(req.params.id, status, rejectionReason)
    sendSuccess(res, { order })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    const result = await orderService.removeOrder(req.params.id)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}
