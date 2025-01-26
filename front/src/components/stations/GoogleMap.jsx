import { Box,Paper } from '@mui/material'
export const GoogleMap = () => {
  return (
  
      <Paper elevation={3} sx={{ position: 'relative', textAlign: 'right', height: "100%"}}>
      <Box sx={{ overflow: 'hidden', background: 'none!important', height:["400px","100%"] }}>
        <iframe
        title='google map'
          width="100%"
          height="100%"
          id="gmap_canvas"
          src="https://maps.google.com/maps?q=sohag+Egypt&t=&z=10&ie=UTF8&iwloc=&output=embed"
       
        />
      </Box>
    </Paper>

  )
}
