import React from 'react'
import {Box} from "@mui/material"
import { SubHero } from '../components/general/SubHero'
import { Faqs } from '../components/faqs/Faqs'
import faq from "../assets/faq.jpg"
export const FaqPage = () => {
  return (
    <Box >
       <SubHero background={faq} page="faqs"/>
       <Faqs/>
    </Box>
  )
}
