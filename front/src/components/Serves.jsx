import { Container, Grid, Paper, Typography } from "@mui/material";
import { Box, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mui/material";
const Data = [
  {
    title: "Get Real Comfort",
    body: "Extra legroom, full of entertaining features on board",
    id: 1,
  },
  {
    title: "Safe & Reliable",
    body: "Your road trip is more safe, peaceful and well served.",
    id: 2,
  },
  {
    title: "Track Your Trip",
    body: "Find bus location online using your booking number.",
    id: 3,
  },
];
export const Serves = () => {
  const isSm = useMediaQuery("(max-width: 600px)");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ref, inView] = useInView({ threshold: 0.0001, triggerOnce: true });
  return (
    <Container sx={{ paddingY: 6 }} id="Services">
      <Box sx={{ textAlign: "center" }}>
        <Box>
          <Typography
            variant="h2"
            sx={{
              width: ["100%", "100%", "60%"],
              fontSize: ["20px", "20px", "60px"],
              fontWeight: "bold",
              margin: "auto",
              color: "text.main",
              marginBottom: 4,
            }}
          >
            {t("The Best Public Transportation in Egypt")}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ paddingY: 4 }}>
        {Data.map((item) => (
          <Grid item xs={12} md={4} key={item.id}>
            <motion.div
              ref={ref}
              initial={{ y: 100, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : undefined}
              transition={{ duration: 0.5, delay: item.id * 0.2 }}
            >
              <Paper
                elevation={10}
                sx={{ padding: 3, color: "text.main", borderRadius: "20px" }}
              >
                <Typography variant="h5" component="h3">
                  {t(item.title)}
                </Typography>
                <Typography variant="body1" component="p" sx={{fontSize:"18px"}}>
                  {t(item.body)}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          sx={{
            padding: 2,
            m: 2,
            fontWeight: "bold",
            width: ["90%", "90%", "auto"],
            fontSize: "19px",
         
          }}
          onClick={() => navigate("/")}
        >
          {t("Booking Now")}
        </Button>
        <Button
          variant="outlined"
          sx={{
            padding: 2,
            m: 2,
            fontSize: "19px",
            fontWeight: "bold",
            width: ["90%", "90%", "auto"],
          }}
          onClick={() => navigate("/register")}
        >
          {t("Creat Acount")}
        </Button>
      </Box>
    </Container>
  );
};
