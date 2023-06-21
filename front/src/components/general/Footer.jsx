import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import footer from "../../assets/footer.jpeg";
import {
  Container,
  Grid,
  Box,
  Typography,
  List,
  ListItem,
  Stack,
} from "@mui/material";
import { Phone, Telegram,Facebook, LinkedIn } from "@mui/icons-material";

import { useTranslation } from "react-i18next";
const styleLink = {
  textDecoration: "none",
  color: "white",
  fontSize: "20px ",
  fontWeight: "400",
  transition: "all .5s linear ",
};
const year = 2023;
export const Footer = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        background: `url(${footer}), linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9))`,
        backgroundBlendMode: "multiply",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        paddingY: 2,
      }}
    >
      <Container sx={{ position: "relative", zIndex: 4, color: "text.therd" }}>
        <Grid container sx={{pb:2}}>
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box>
              <Link to="">
                <img
                  src={logo}
                  alt="logo"
                  loading="lazy"
                  style={{ width: "100px", height: "100px" }}
                />
              </Link>
            </Box>
          </Grid>
          <Grid item  xs={6} md={3}>
            <List>
              <ListItem>
                <Link to="/" style={styleLink}>
                  {t("Booking Now")}
                </Link>
              </ListItem>
              <ListItem>
                <Link to="/faqs" style={styleLink}>
                  {t("Faqs")}
                </Link>
              </ListItem>
              <ListItem>
                <Link to="/register" style={styleLink}>
                  {t("Register")}
                </Link>
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={6} md={3}>
            <List>
              <ListItem>
                <Link to="/about us" style={styleLink}>
                 {t("About Us")} 
                </Link>
              </ListItem>
              <ListItem>
                <a href="#Services" style={styleLink}>
                  {t("Services")}
                </a>
              </ListItem>
              <ListItem>
                <Link to="/stations" style={styleLink}>
                  {t("Stations")}
                </Link>
              </ListItem>
            </List>
          </Grid>
          <Grid item  xs={12} md={3} paddingTop={2}>
            <Typography variant="h5">{t("Contact Us")}</Typography>
            <Typography variant="h4" component="p" p={2} fontWeight="bold">
              {" "}
              <Phone fontSize="medium" />   <a href={`tel:01201453941`} style={{ color: "white",textDecoration:"none",fontSize:"20px" }}>01201453941 </a> 
            </Typography>
            <Stack direction="row" spacing={2} paddingLeft={3}>
             <a href="https://www.facebook.com/profile.php?id=100082996239556" target="_blank" style={{ color: "white" }}>
                <Facebook fontSize="medium" />
              </a>
              <a href="https://t.me/MahmoudRdwann" target="_blank" style={{ color: "white" }}>
                <Telegram fontSize="medium" />
              </a>
              <a href="https://www.linkedin.com/in/Mahmoud-Mohamed-Abdel-Aal" target="_blank" style={{ color: "white" }}>
                <LinkedIn fontSize="medium" />
              </a>
            </Stack>
          </Grid>
        </Grid>
        <Box
          sx={{
            width: ["100%", "100%", "60%"],
            margin: "auto",
            textAlign: "center",
            paddingTop: 1,
            fontSize: "20px",
            color: "text.therd",
            pt:2,
            borderTop:"2px solid #fff"
          }}
        >
         {t("All Copyrights revserved for")}  &copy; {year}{" "}
          <Typography
            variant="h6"
            component="span"
            sx={{ color: "text.therd", fontWeight: "bold" }}
          >
            {t("Tazkarty")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
