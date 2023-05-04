import React from 'react'
import { SubAbout } from '../components/about/SubAbout'
import { SubHero } from '../components/general/SubHero'
import about from "../assets/aboutHero.jpg"
import { Box } from '@mui/material'
export const AboutPage = () => {
  return (
    <Box>
        <SubHero background={about} page="About Us"/>
        <SubAbout/>
    </Box>
  )
}
