import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
export default function Faq({ faq, expanded, handleChange }) {
  return (
    <Paper elevation={5}>
      <Accordion
        expanded={expanded === `panel${faq.id}`}
        onChange={handleChange(`panel${faq.id}`)}
      >
        <AccordionSummary
          sx={{ backgroundColor: "background.secondary", color: "text.main" }}
          expandIcon={<ExpandMore />}
          aria-controls={`panel${faq.id}d-content`}
          id={`panel${faq.id}d-header`}
        >
          <Typography
            sx={{ color: "main", fontSize: "18px", fontWeight: "bold" }}
          >
            {faq.title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: "background.secondary" }}>
          <Typography sx={{ color: "text.main", fontSize: "18px" }}>
            {faq.body}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
