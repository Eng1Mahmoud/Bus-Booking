import { Box } from '@mui/material'
import { SubHero } from '../components/general/SubHero'
import stationsImage from "../assets/station.jpg";
import { StationContainer } from '../components/stations/StationContainer';
const StationsPage = () => {
  return (
    <Box>
    <SubHero page="Stations" background={stationsImage}/> 
    <StationContainer/>
    </Box>
  )
}

export default StationsPage