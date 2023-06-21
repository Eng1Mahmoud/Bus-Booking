import {
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  Typography,
  CardActions,
  CardContent,
  CardMedia,
  CardActionArea,
  Card,
  Paper,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import busImage from "../../assets/busTiket.jpg";
import notFoundTrips from "../../assets/notFoundTrips.png";
import Book from "./Book";
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { useTranslation } from "react-i18next";
export const Trips = () => {
  const { t } = useTranslation();
  const [allTrips, SetAllTrips] = useState([]);
  const trips = useSelector((state) => state.trips.trips);
  useEffect(() => {
    SetAllTrips(trips);
  }, [trips]);

  return (
    <Box sx={{ paddingY: "30px" }}>
      <Container>
        <Divider
          sx={{
            paddingBottom: "50px",
            maxWidth: ["300px,300px", "500px"],
            margin: "auto",
          }}
        >
          <Chip
            label={t("Avilable Trips")}
            sx={{ fontSize: "25px", color: "main", padding: "3px" }}
          />
        </Divider>
        <Grid container spacing={2}>
          {allTrips.length > 0 ? (
            allTrips[0].bus.map((trip, i) => {
              return (
                <Grid item xs={12} md={6} key={i}>
                  <Paper elevation={10}>
                  <Card>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        image={busImage}
                        alt="bus"
                        loading="lazy"
                        sx={{ height: "300px" }}
                      />
                      <CardContent>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", paddingBottom: "5px" }}
                        >
                          {t(allTrips[0].from)}
                          <LocationOnIcon
                            sx={{ color: "main", fontSize: "17px" }}
                          />
                          {t(allTrips[0].to)}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {allTrips[0].date}{" "}
                          <AccessTimeIcon
                            sx={{ color: "main", fontSize: "17px" }}
                          />{" "}
                          {trip.time}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                          {trip.price}  
                          <CurrencyPoundIcon
                            sx={{ color: "main", fontSize: "20px" }}
                          />
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions sx={{ marginY: "5px" }}>
                      <Book
                        tripDetils={{
                          from: allTrips[0].from,
                          to: allTrips[0].to,
                          date: allTrips[0].date,
                          seats: trip.seats,
                          busNumber: trip.number,
                          price: trip.price,
                        }}
                      />
                    </CardActions>
                  </Card>
                  </Paper>
                </Grid>
              );
            })
          ) : (
            <>
             

              <Grid item xs={12} md={6}>
                <Typography sx={{ color: "text.main",fontSize:"40px" }}>
                  {t("Unfortunately, there are no Trips matching the data entered")}
                  <SentimentVeryDissatisfiedIcon sx={{color:"error.main",fontSize:"40px" ,ml:3,}}/>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box >
                  <img src={notFoundTrips} alt="not found" loading="lazy" style={{width:"100%",height:"100%"}}/>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </Box>
  );
};
