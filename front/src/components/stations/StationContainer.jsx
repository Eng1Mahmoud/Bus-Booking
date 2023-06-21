import { Box, Container, Grid,Typography } from "@mui/material";
import { GoogleMap } from "./GoogleMap";
import { Stations } from "./stations";
import { useTranslation } from "react-i18next";
export const StationContainer = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ paddingY: 3, marginY: 3}}>
      <Container>
      <Box sx={{ paddingBottom: 5 }}>
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                color: "text.main",
                fontWeight: "bold",
                fontSize: "25px",
              }}
            >
           {t("Tazkarty Stations On Egypt")}
            </Typography>
          </Box>
        <Grid container >
          <Grid item xs={12} md={6}>
            <Stations />
          </Grid>
          <Grid item xs={12} md={6}>
            <GoogleMap />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
