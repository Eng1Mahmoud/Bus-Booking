import { configureStore } from '@reduxjs/toolkit';
import persistedTripsReducer from './slices/TripsSlice';
import { persistStore } from 'redux-persist';

const store = configureStore({
  reducer: {
    trips: persistedTripsReducer,
  },
});

const persistor = persistStore(store);

export { store, persistor };
