import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { SyntheticEvent } from "react";

export interface FaqItem {
  id: number;
  title: string;
  body: string;
}

interface FaqProps {
  faq: FaqItem;
  /** The id of the panel currently open, or false when all are closed. */
  expanded: string | false;
  handleChange: (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => void;
}

export default function Faq({ faq, expanded, handleChange }: FaqProps) {
  const { t } = useTranslation();
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
          <Typography sx={{ color: "main", fontSize: "18px", fontWeight: "bold" }}>
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
