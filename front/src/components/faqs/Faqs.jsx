import React from "react";
import { Box, Container, Paper, Typography, Stack } from "@mui/material";
import Faq from "./Faq";
import { useTranslation } from "react-i18next";
const faqs = [
  {
    id: 1,
    title: "Can I switch (Change)to an earlier bus?",
    body: "You can switch (change) your ticket through our stations regarding to the Change policy.",
  },
  {
    id: 2,
    title: "I've printed out my ticket but left it at home. What do I do?",
    body: "When you get to the station, you'll need to go to the ticket counter and speak to one of our representatives. Make sure you have plenty of time before your bus leaves.",
  },
  {
    id: 3,
    title: "How much time do I have at a rest stop (for buses that have stop)?",
    body: "The length of the stop depends on whether the bus needs to be serviced too, which could take a little longer. But don't worry, you will always have time to stretch your legs, use the restroom or grab a snack. At least there will be 20 minutes for rest.",
  },
  {
    id: 4,
    title: "Can I get a refund for cancellations?",
    body: "Cancellation or refund is allowed - 4 hours before the trip time : you'll get full refund without 6.6% fees. - Less than 4 hours before the trip: In case of full cancellation, ticket will be subject for 50% refund fee from the ticket total cost. - Than 4 hours during the trip In case of changing the date, ticket will be subject for 25% deducted from the ticket subject for editing. - Refund or modify is not available 2 hour before your trip time.",
  },
  {
    id: 5,
    title: "Should the child require a seat?",
    body: "For any Children's 4 years old and above have to buy his/her own seat ticket.",
  },
  {
    id: 6,
    title: "I forgot my baggage at the station/ on the bus?",
    body: "If we find your baggage, you can receive it from the nearest station to your home. If you live far away from our stations, you’ll need to make arrangements with our customer care center for your baggage to be shipped to you.",
  },
  {
    id: 7,
    title: "How many pieces of luggage can I take?",
    body: "Passengers can check in 2 pieces of luggage (up to 35 KG each) for no extra fee plus one small carry on.",
  },
];
export const Faqs = () => {
  const { t} = useTranslation();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  return (
    <Box sx={{ paddingY: 3, marginY: 3, color: "main" }}>
      <Container maxWidth="md">
        <Paper elevation={8} sx={{ p: [1, 1, 3], borderRadius: "15px" }}>
          <Box sx={{ paddingY: 4 }}>
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                color: "text.main",
                fontWeight: "bold",
                fontSize: "23px",
              }}
            >
              {t("Frequently Asked Questions")}
            </Typography>
          </Box>

          <Stack spacing={2}>
            {faqs.map((faq) => {
              return (
                <Faq
                  faq={faq}
                  key={faq.id}
                  expanded={expanded}
                  handleChange={handleChange}
                />
              );
            })}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};
