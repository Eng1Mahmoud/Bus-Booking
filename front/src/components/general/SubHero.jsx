import React from "react";
import { Box, Typography, Breadcrumbs } from "@mui/material";
import { Link } from "react-router-dom";
import { Home } from "@mui/icons-material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { WaveShap } from "./WaveShap";

export const SubHero = ({ background, page }) => {
  return (
    <Box
      sx={{
        background: `url(${background}), linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))`,
        backgroundBlendMode: "multiply",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "80vh",
        width: "100%",
        position: "relative",
      
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textTransform: "capitalize",
          color:"text.therd"
        }}
      >
        <Typography variant="h2" sx={{pb:2}}>{page}</Typography>
        <Box>
          <Breadcrumbs
            separator={
              <KeyboardDoubleArrowRightIcon
                sx={{ color: "text.therd" }}
                fontSize="medium"
              />
            }
            aria-label="breadcrumb"
          >
            <Link
              to="/"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: "20px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="large" />
              <Typography variant="h6" component="span">
                Home
              </Typography>
            </Link>

            <Typography
              sx={{ display: "flex", alignItems: "center", fontSize: "20px",  color:"text.therd" }}
            >
              {page}
            </Typography>
          </Breadcrumbs>
        </Box>
      </Box>
      <WaveShap />
    </Box>
  );
};
