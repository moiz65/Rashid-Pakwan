import reduxPersistStorage from 'redux-persist/lib/storage/index.js'

const nested = reduxPersistStorage?.default ?? reduxPersistStorage
const resolved = nested?.default ?? nested

export const persistStorage =
  typeof resolved?.getItem === 'function'
    ? resolved
    : {
        getItem: (key) => Promise.resolve(localStorage.getItem(key)),
        setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
        removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
      }
