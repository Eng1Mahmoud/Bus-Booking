import { useEffect } from "react";
import MuiAppbar from "../components/general/Navbar";
import { Footer } from "../components/general/Footer";
import { ScrollTop } from "../components/general/ScrollTop";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/theme";
import themeDark from "@/theme";
import { useAppSelector } from "@/store";
export const Root = () => {
  const themDark = useAppSelector((state) => state.trips.themeDark);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <ThemeProvider theme={themDark ? themeDark : theme}>
      <Box sx={{ backgroundColor: "background.main", position: "relative" }}>
        <MuiAppbar />
        <ScrollTop />
        <Outlet />
        <Footer />
      </Box>
    </ThemeProvider>
  );
};
