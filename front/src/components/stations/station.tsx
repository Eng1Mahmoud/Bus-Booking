import type { SyntheticEvent } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { ExpandMore, LocationCity } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
export interface CityStations {
  id: number;
  city: {
    name: string;
    /** Pre-encoded Google Maps query for this city. */
    query: string;
  };
  /** Station names; translated through i18next at render time. */
  stations: string[];
}

interface StationProps {
  city: CityStations;
  expanded: string | false;
  handleChange: (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => void;
}

export default function Station({ city, expanded, handleChange }: StationProps) {
  const { t } = useTranslation();
  return (
    <Paper elevation={5}>
      <Accordion
        expanded={expanded === `panel${city.id}`}
        onChange={handleChange(`panel${city.id}`)}
      >
        <AccordionSummary
          sx={{ backgroundColor: "background.secondary", color: "text.main" }}
          expandIcon={<ExpandMore />}
          aria-controls={`panel${city.id}d-content`}
          id={`panel${city.id}d-header`}
        >
          <Typography sx={{ color: "main", fontSize: "18px", fontWeight: "bold" }}>
            {t(city.city.name)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ paddingTop: 2, backgroundColor: "background.secondary" }}
        >
          <Grid container spacing={3}>
            {city.stations.map((station: string, index: number) => {
              return (
                <Grid size={{ xs: 12, md: 6 }} key={`${city.city.name} ${index}`}>
                  <Paper
                    elevation={5}
                    sx={{
                      p: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "text.main",
                    }}
                  >
                    <Typography component="p" sx={{ flexGrow: 1, color: "main" }}>
                      {t(station)}
                    </Typography>
                    <Typography component="span" sx={{ flexGrow: 1 }}>
                      <Link
                        to={`https://www.google.com/maps/search/?api=1&query=${city.city.query}`}
                      >
                        <LocationCity sx={{ color: "text.main" }} />
                      </Link>
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
