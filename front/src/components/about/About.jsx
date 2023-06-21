import React from "react";
import { Grid, Box, Typography, Divider, Chip, Button } from "@mui/material";
import serves from "../../assets/about.png";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
const aboutP = [
  {
    id: 1,
    body: "Welcome to Tazkarty, the Easiest Way to Book Bus Tickets OnlineTazkarty is an online platform tha",
  },

  {
    id: 2,
    body: "Tazkarty is currently available in several cities across Egypt, including Sohag, Qena, Cairo, Giza, Alexandria, Assiut, Minya",
  },
  {
    id: 3,
    body: "No matter where you're traveling in Egypt, Tazkarty makes it easy to book your bus tickets online. So why wait? Book your tickets with Tazkarty today and enjoy a hassle-free travel experience!a",
  },
];
export const About = () => {
  const { t } = useTranslation();
  return (
    <Grid container rowSpacing={3} justifyContent="center">
      <Grid item xs={12} md={6} p={5} sx={{ color: "text.main" }}>
        <Box>
          <Divider textAlign="left" sx={{ color: "text.main" }}>
            <Chip
              label={t("About Us")}
              sx={{
                backgroundColor: "background.secondary",
                color: "text.main",
                fontWeight: "bold",
              }}
            />
          </Divider>
          <Typography
            variant="h3"
            sx={{
              color: "main",
              fontWeight: "bold",
              paddingY: 2,
              fontSize: ["30px", "50px"],
            }}
          >
            {t("About Tazkarty Bus Company")}
          </Typography>

          <Box>
            {aboutP.map((p) => (
              <Typography
                variant="body1"
                component="p"
                key={p.id}
                sx={{ color: "main", paddingY: 2,fontSize: ["15px", "20px"] }}
              >
                {t(p.body)}
              </Typography>
            ))}
            <Button
              variant="contained"
              sx={{ paddingX: 4, paddingY: 1, fontWeight: "bold",fontSize:"25px",marginTop:3 }}
              component={Link}
              to="/"
            >
              {" "}
              {t("Booking Now")}
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} md={6} p={5}>
        <Box>
          <img
            src={serves}
            alt="about"
            loading="lazy"
            style={{ width: "100%", height: "550px" }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};
