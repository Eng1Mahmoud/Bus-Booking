import React from 'react'
import {Box} from "@mui/material"
import { SubHero } from '../components/general/SubHero'
import { Faqs } from '../components/faqs/Faqs'
import faq from "../assets/faq.jpg"
const FaqPage = () => {
  return (
    <Box >
       <SubHero background={faq} page="Faqs"/>
       <Faqs/>
    </Box>
  )
}

export default FaqPage