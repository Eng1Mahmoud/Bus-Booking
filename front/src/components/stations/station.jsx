import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { ExpandMore, LocationCity } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function Station({ city, expanded, handleChange }) {
  return (
    <Paper  elevation={5}>
      <Accordion
        expanded={expanded === `panel${city.id}`}
        onChange={handleChange(`panel${city.id}`)}
      >
        <AccordionSummary
          sx={{ backgroundColor: "background.secondary",color:"text.main" }}
          expandIcon={<ExpandMore />}
          aria-controls={`panel${city.id}d-content`}
          id={`panel${city.id}d-header`}
        >
          <Typography
            sx={{ color: "main", fontSize: "18px", fontWeight: "bold" }}
          >
            {city.city.name}
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ paddingTop: 2, backgroundColor: "background.secondary" }}
        >
          <Grid container spacing={3}>
            {city.stations.map((station, index) => {
              return (
                <Grid item xs={12} md={6} key={`${city.city.name} ${index}`}>
                  <Paper   elevation={5}
                    sx={{
                      p: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color:"text.main"
                    }}
                  >
                    <Typography
                      component="p"
                      sx={{ flexGrow: 1, color: "main" }}
                    >
                      {station}
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
