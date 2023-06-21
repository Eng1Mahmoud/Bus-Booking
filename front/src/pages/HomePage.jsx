import React from 'react'
import { Serves } from '../components/Serves'
import { About } from '../components/about/About'
import { Payment } from "../components/Payment"
import { Hero } from '../components/Hero'
const Home = () => {
  return (
  <>
  <Hero/>
  <Serves/>
  <About/>
  <Payment/>
  </>
  )
}
export default Home