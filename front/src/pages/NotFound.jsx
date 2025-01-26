import notFoundPage from '../assets/notFoundPage.jpg'
import { Box, Typography ,Button} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate  } from "react-router-dom";
const NotFound = () => {
  const { t } = useTranslation();
  const navigat = useNavigate ()
  return (
    <Box sx={{/* display:"flex",alignItems:"center",justifyContent:"center" */height:"85vh"}}>
        <img src={notFoundPage} alt="not found page" style={{width:"100%",height:"100%"}}/>
        <Box sx={{display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Typography sx={{textAlign:"center",color:"red",fontWeight:"bold",fontSize:"30px"}}>{t("Page Not Found")}</Typography>
        <Button  variant="contained" sx={{mx:1}} onClick={()=> navigat("/")}>{t("Return To Home")}</Button>
        </Box>
       
    </Box>
  );
};

export default NotFound;
