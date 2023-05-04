import { Box } from '@mui/material'
import React from 'react'
import MuiForm from './MuiForm'
import { Swepers } from './Swepers'

export const Hero = () => {
  return (
    <Box sx={{position:"relative",height:`90vh`}}>
        <Swepers/>
        <MuiForm/>
    </Box>
  )
}
