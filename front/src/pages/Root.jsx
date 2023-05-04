import React, { useEffect} from "react";
import MuiAppbar from "../components/general/Navbar";
import { Footer } from "../components/general/Footer";
import { Outlet,useLocation  } from "react-router-dom";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../them";
import { themeDark } from "../them";
import { useSelector } from "react-redux";
export const Root = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

const themDark = useSelector(state => state.TripsSlice.themDark)
  return (
    <ThemeProvider theme={themDark ? themeDark : theme}>
      <Box sx={{ backgroundColor: "background.main" }}>
        <MuiAppbar />
        <Outlet />
        <Footer />
      </Box>
    </ThemeProvider>
  );
};
