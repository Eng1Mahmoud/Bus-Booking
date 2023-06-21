import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  trips: [],
  themeDark: true,
  lang: "en",
};

const tripsPersistConfig = {
  key: "trips",
  storage,
};

export const TripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    activeTrips: (state, { payload }) => {
      state.trips = payload;
    },
    activeThemeDark: (state, { payload }) => {
      state.themeDark = payload;
    },
    changLang: (state, { payload }) => {
      state.lang = payload;
    },
  },
});

export const { activeTrips, activeThemeDark, changLang } = TripsSlice.actions;

const persistedTripsReducer = persistReducer(
  tripsPersistConfig,
  TripsSlice.reducer
);

export default persistedTripsReducer;
