import { createSlice } from '@reduxjs/toolkit'
import { ALL_BRANCHES } from '@/lib/branches'

const branchesSlice = createSlice({
  name: 'branches',
  initialState: {
    items: [],
    selectedBranchId: ALL_BRANCHES,
    demoOrders: [],
    demoCustomers: [],
    demoCarts: [],
  },
  reducers: {
    setBranches: (state, action) => {
      state.items = action.payload || []
    },
    setSelectedBranchId: (state, action) => {
      state.selectedBranchId = action.payload || ALL_BRANCHES
    },
    addBranch: (state, action) => {
      state.items.push(action.payload)
    },
    updateBranch: (state, action) => {
      const idx = state.items.findIndex((b) => b.id === action.payload.id)
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload }
    },
    deleteBranch: (state, action) => {
      const id = action.payload
      state.items = state.items.filter((b) => b.id !== id)
      if (state.selectedBranchId === id) state.selectedBranchId = ALL_BRANCHES
    },
    updateDemoOrderStatus: (state, action) => {
      const { id, status, rejectionReason } = action.payload
      const order = state.demoOrders.find((o) => o.id === id)
      if (!order) return
      order.status = status
      if (rejectionReason !== undefined) order.rejectionReason = rejectionReason
      if (!['rejected', 'cancelled'].includes(status)) order.rejectionReason = null
    },
    addDemoOrder: (state, action) => {
      state.demoOrders.unshift(action.payload)
    },
    deleteDemoOrder: (state, action) => {
      state.demoOrders = state.demoOrders.filter((o) => o.id !== action.payload)
    },
    addDemoCustomer: (state, action) => {
      state.demoCustomers.unshift(action.payload)
    },
    deleteDemoCustomer: (state, action) => {
      state.demoCustomers = state.demoCustomers.filter((c) => c.id !== action.payload)
    },
    deleteDemoCart: (state, action) => {
      state.demoCarts = state.demoCarts.filter((c) => c.id !== action.payload)
    },
    resetBranchDemo: (state) => {
      state.demoOrders = []
      state.demoCustomers = []
      state.demoCarts = []
    },
  },
})

export const {
  setBranches,
  setSelectedBranchId,
  addBranch,
  updateBranch,
  deleteBranch,
  updateDemoOrderStatus,
  addDemoOrder,
  deleteDemoOrder,
  addDemoCustomer,
  deleteDemoCustomer,
  deleteDemoCart,
  resetBranchDemo,
} = branchesSlice.actions

export default branchesSlice.reducer
