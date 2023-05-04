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
import { Phone, Facebook, Twitter, LinkedIn } from "@mui/icons-material";
const styleLink = {
  textDecoration: "none",
  color: "white",
  fontSize: "20px ",
  fontWeight: "400",
  transition: "all .5s linear ",
};
const year = 2023;
export const Footer = () => {
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
        <Grid container>
          <Grid
            item
            xs={6}
            md={3}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box>
              <Link to="">
                <img
                  src={logo}
                  alt="logo"
                  style={{ width: "100px", height: "100px" }}
                />
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <List>
              <ListItem>
                <Link to="/" style={styleLink}>
                  Boock Now
                </Link>
              </ListItem>
              <ListItem>
                <Link to="/faqs" style={styleLink}>
                  FAQ
                </Link>
              </ListItem>
              <ListItem>
                <Link to="/register" style={styleLink}>
                  Register
                </Link>
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <List>
              <ListItem>
                <Link to="/about us" style={styleLink}>
                  About Us
                </Link>
              </ListItem>
              <ListItem>
                <a href="#Services" style={styleLink}>
                  Services
                </a>
              </ListItem>
              <ListItem>
                <Link to="/stations" style={styleLink}>
                  Stations
                </Link>
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={6} md={3} paddingTop={2}>
            <Typography variant="h5">Contact Us</Typography>
            <Typography variant="h4" component="p" p={2} fontWeight="bold">
              {" "}
              <Phone fontSize="large" /> 16128
            </Typography>
            <Stack direction="row" spacing={2} paddingLeft={3}>
              <Link to="" style={{ color: "white" }}>
                <Facebook fontSize="medium" />
              </Link>
              <Link to="" style={{ color: "white" }}>
                <Twitter fontSize="medium" />
              </Link>
              <Link to="" style={{ color: "white" }}>
                <LinkedIn fontSize="medium" />
              </Link>
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
          }}
        >
          All Copyrights revserved for &copy; {year}{" "}
          <Typography
            variant="h6"
            component="span"
            sx={{ color: "text.therd", fontWeight: "bold" }}
          >
            Tazkarty
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
