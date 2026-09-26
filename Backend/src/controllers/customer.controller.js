import * as customerService from '../services/customer.service.js'
import { sendSuccess } from '../utils/response.js'

export async function list(req, res, next) {
  try {
    const customers = await customerService.listCustomers(req.query)
    sendSuccess(res, { customers })
  } catch (err) {
    next(err)
  }
}

export async function getById(req, res, next) {
  try {
    const customer = await customerService.getCustomer(req.params.id)
    sendSuccess(res, { customer })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const customer = await customerService.createCustomer(req.body)
    sendSuccess(res, { customer }, 201)
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body)
    sendSuccess(res, { customer })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    const result = await customerService.removeCustomer(req.params.id)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}
