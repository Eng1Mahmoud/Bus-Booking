import {useRef,useState} from "react";
import { Box } from "@mui/material";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
export const ScrollTop = () => {
const scrolTop = useRef()
const [show,setShow]=useState(false)

window.onscroll = ()=>{
    if(window.scrollY  >= 200){
        setShow(true)
    }
    else{
        setShow(false)
}
}
  return (
    <Box
      ref={scrolTop}
      sx={{
        position: "fixed",
        bottom: "50px",
        right: "30px",
        backgroundColor: "text.main",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        justifyContent:"center",
        alignItems:"center",
        fontSize:"70px",
        fontWeight:"bold",
        cursor:"pointer",
        display:show?"flex":"none",
        zIndex:100
      }}
      onClick={()=> window.scrollTo(0,0)}
    >
      <KeyboardDoubleArrowUpIcon sx={{ color: "background.main" }} />
    </Box>
  );
};
