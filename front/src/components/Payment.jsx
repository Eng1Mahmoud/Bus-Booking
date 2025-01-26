import { Container, Grid, Box, Typography, Button } from "@mui/material";
import pay1 from "../assets/paypal.png";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const payment = [
  {
    id: 1,
    image: pay1,
  },
];

export const Payment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <Container sx={{ paddingY: 5, color: "main" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            width: ["100%", "100%", "70%", "60%"],
            fontSize: ["20px", "20px", "60px"],
            paddingBottom: 3,
            fontWeight: "bold",
            margin: "auto",
            color: "text.main",
          }}
        >
          {t("Secure and Convenient Payment Methods")}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            width: ["100%", "100%", "70%", "60%"],
            fontSize: "30px",
            paddingBottom: 3,
            fontWeight: "bold",
            margin: "auto",
            color: "text.main",
          }}
          component="p"
        >
         {t("You can pay using Paypal")} 
        </Typography>
      </Box>
      <Grid
        container
        spacing={3}
        sx={{ paddingY: 4, justifyContent: "center" }}
      >
        {payment.map((item) => {
          return (
            <Grid item key={item.id} xs={12} md={7}>
              <motion.div
                ref={ref}
                initial={{ y: 100, opacity: 0 }}
                animate={inView ? { y: 0, opacity: 1 } : undefined}
                transition={{ duration: 1 }}
              >
                <Box
                  elevation={4}
                  sx={{ padding: 3, color: "text.main", borderRadius: "20px" }}
                >
                  <img
                    className="img-fluid"
                    src={item.image}
                    alt="payment"
                    loading="lazy"
                    style={{ width: "100%" }}
                  />
                </Box>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: ["30px", "30px", "50px"],
            paddingBottom: 3,
            fontWeight: "bold",
            margin: "auto",
            color: "text.main",
          }}
        >
          {t("OR")}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            width: ["100%", "100%", "70%", "60%"],
            fontSize: "30px",
            paddingBottom: 3,
            fontWeight: "bold",
            margin: "auto",
            color: "text.main",
          }}
          component="p"
        >
          {t("Reserve your ticket at one of our stations")}
        </Typography>
        <Button
          variant="contained"
          sx={{ fontWeight: "bold", paddingX: 4, paddingY: 1 }}
          onClick={() => navigate("/stations")}
        >
          {t("Find Us")}
        </Button>
      </Box>
    </Container>
  );
};
