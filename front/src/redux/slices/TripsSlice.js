import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  trips:[],
  themDark:null
}

export const TripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    activeTrips: (state,{payload}) => {
        state.trips=payload
    },
    acticeThemDark:(state,{payload}) =>{
      state.themDark = payload
    }
   
  },
})


export const { activeTrips,acticeThemDark} = TripsSlice.actions

export default TripsSlice.reducer