import { configureStore } from '@reduxjs/toolkit'
import TripsSlice from './slices/TripsSlice'
export const store = configureStore({
  reducer: {
    TripsSlice
  },
})