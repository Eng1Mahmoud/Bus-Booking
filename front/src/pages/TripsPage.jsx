import {Box} from "@mui/material"
import { SubHero } from '../components/general/SubHero'
import faq from "../assets/trips.jpg"
import { Trips } from '../components/Trips/Trips'
const TripsPage = () => {
  return (
    <Box >
       <SubHero background={faq} page="Avilable Trips"/>
       <Trips/>
    </Box>
  )
}

export default TripsPage
