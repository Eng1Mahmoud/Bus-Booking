import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { Trip, TripsState } from '../../types';

const initialState: TripsState = {
  trips: [],
  themeDark: true,
  lang: 'en',
};

const tripsPersistConfig = {
  key: 'trips',
  storage,
};

export const TripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    activeTrips: (state, action: PayloadAction<Trip[]>) => {
      state.trips = action.payload;
    },
    activeThemeDark: (state, action: PayloadAction<boolean>) => {
      state.themeDark = action.payload;
    },
    changLang: (state, action: PayloadAction<string>) => {
      state.lang = action.payload;
    },
  },
});

export const { activeTrips, activeThemeDark, changLang } = TripsSlice.actions;

const persistedTripsReducer = persistReducer(tripsPersistConfig, TripsSlice.reducer);

export default persistedTripsReducer;
