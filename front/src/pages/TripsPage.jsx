import React from 'react'
import {Box} from "@mui/material"
import { SubHero } from '../components/general/SubHero'
import faq from "../assets/trips.jpg"
import { Trips } from '../components/Trips/Trips'
export const TripsPage = () => {
  return (
    <Box >
       <SubHero background={faq} page="Trips"/>
       <Trips/>
    </Box>
  )
}
