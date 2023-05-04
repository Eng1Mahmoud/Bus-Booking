import {
  Box,
  Container,
  Grid,
  Divider,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import subabout from "../../assets/subabout.jpg";
import React from "react";
const aboutP = [
  {
    id: 1,
    body: "Welcome to Tazkarty, the Easiest Way to Book Bus Tickets OnlineTazkarty is an online platform tha",
  },
  {
    id: 2,
    body: "With our user-friendly interface, you can easily search for available buses and choose the one that best fits your needs. Our secure payment gateway ensures that your transactions are safe and hassle-free. Plus, we offer a flexible cancellation policy to make sure you can change your plans if needed.",
  },
  {
    id: 3,
    body: "Whether you're traveling for business or pleasure, Tazkarty has got you covered. Our 24/7 customer support team is always available to assist you with any questions or concerns you may have. So, if you're looking for a hassle-free and convenient way to book your bus tickets, look no further than Tazkarty.",
  },
  {
    id: 4,
    body: "Tazkarty is currently available in several cities across Egypt, including Sohag, Qena, Cairo, Giza, Alexandria, Assiut, Minya",
  },
  {
    id: 5,
    body: "No matter where you're traveling in Egypt, Tazkarty makes it easy to book your bus tickets online. So why wait? Book your tickets with Tazkarty today and enjoy a hassle-free travel experience!a",
  },
];
export const SubAbout = () => {
  return (
    <Box sx={{ paddingY: 5, paddingX: [0, 0, 3] }}>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Divider textAlign="left" sx={{ color: "text.main" }}>
                <Chip
                  label="About Us"
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
                  color: "text.main",
                  fontWeight: "bold",
                  paddingY: 2,
                  fontSize: ["30px", "50px"],
                }}
              >
                About Tazkarty Bus Company
              </Typography>
              <Box sx={{color:"text.main"}}>
                {aboutP.map((p) => (
                  <Typography
                    variant="body1"
                    component="p"
                    key={p.id}
                    sx={{ color: "main", paddingY: 2 }}
                  >
                    {p.body}
                  </Typography>
                ))}
                <Button
                  variant="contained"
                  sx={{ paddingX: 4, paddingY: 2, fontWeight: "bold" }}
                  component={Link}
                  to="/"
                >
                  {" "}
                  Booking Now
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                clipPath: "polygon(20% 0%, 100% 0, 100% 100%, 0 100%)",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <img
                src={subabout}
                alt="driver"
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
