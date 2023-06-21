import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function Faq({ faq, expanded, handleChange }) {
  const { t} = useTranslation();
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
           {t(faq.title)} 
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: "background.secondary" }}>
          <Typography sx={{ color: "text.main", fontSize: "18px" }}>
          {t(faq.body)} 
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
