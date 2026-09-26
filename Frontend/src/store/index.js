import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import { persistStorage as storage } from './persistStorage'
import ordersReducer from './slices/ordersSlice'
import customersReducer from './slices/customersSlice'
import productsReducer from './slices/productsSlice'
import categoriesReducer from './slices/categoriesSlice'
import brandsReducer from './slices/brandsSlice'
import addonsReducer from './slices/addonsSlice'
import drinksReducer from './slices/drinksSlice'
import reviewsReducer from './slices/reviewsSlice'
import cartsReducer from './slices/cartsSlice'
import marketingReducer from './slices/marketingSlice'
import settingsReducer from './slices/settingsSlice'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import branchesReducer from './slices/branchesSlice'
import { setCarts } from './slices/cartsSlice'
import { resetBranchDemo } from './slices/branchesSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  orders: ordersReducer,
  customers: customersReducer,
  products: productsReducer,
  categories: categoriesReducer,
  brands: brandsReducer,
  addons: addonsReducer,
  drinks: drinksReducer,
  reviews: reviewsReducer,
  carts: cartsReducer,
  marketing: marketingReducer,
  settings: settingsReducer,
  ui: uiReducer,
  branches: branchesReducer,
})

const persistConfig = {
  key: 'restaurant-admin-store',
  version: 3,
  storage,
  // Auth + branch switcher/demo overlay are frontend-only. Catalog/orders still come from the API.
  whitelist: ['auth', 'branches'],
  migrate: (state) => Promise.resolve({
    ...state,
    auth: state?.auth ?? { isAuthenticated: false, user: null, token: null },
  }),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

/** CatalogSync owns carts; reset clears local list so the next poll refills from the API. */
export function resetDemoData(dispatch) {
  dispatch(setCarts([]))
  dispatch(resetBranchDemo())
}
