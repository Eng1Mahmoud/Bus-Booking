/* eslint-disable react-hooks/exhaustive-deps */
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Box, Grid, Typography } from "@mui/material";
import WeekendIcon from "@mui/icons-material/Weekend";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Complet from "./Complet";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
const Transition = function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
}

export default function Book({ tripDetils }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPide, setShowPide] = useState(false);
  const [open, setOpen] = useState(false);
  const [openComplet, setOpenComplet] = useState(false);
  const [seatNumber, setSeatNumber] = useState(null);
  const completBook = () => {
    axios.post(
      "https://booking-bus.onrender.com/book",
      {
        from: tripDetils.from,
        to: tripDetils.to,
        date: tripDetils.date,
        busNumber: tripDetils.busNumber,
        seatNumber: seatNumber,
        seatePrice: tripDetils.price,
      },
      {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
  };
  // render paypal button

  useEffect(() => {
    const price = (tripDetils.price / 30).toFixed(2);
    window.paypal
      .Buttons({
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: price,
                },
              },
            ],
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function (details) {
            setOpen(false);
            setShowPide(false);
            completBook();
            setOpenComplet(true);
          });
        },
      })
      .render("#paypal-btn");
  }, [showPide, tripDetils.price]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowPide(false);
  };
  const bookTrip = (SeatNumber) => {
    setSeatNumber(SeatNumber);
    if (!Cookies.get("token")) {
      navigate("/login");
    } else {
      setShowPide(true);
    }
  };
  return (
    <Box>
      <Complet opens={openComplet} />
      <Button variant="contained" onClick={handleClickOpen}>
        {t("Booking Now")}
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            marginBottom: "30px",
            color: "main",
            fontWeight: "bold",
          }}
        >
          {showPide
            ? t("Complet Pay with PayPal")
            : t("Choose your seat and start booking")}
        </DialogTitle>
        <DialogContent sx={{ paddingTop: "20px" }}>
          {showPide ? (
            <Box id="paypal-btn"></Box>
          ) : (
            <Grid container spacing={2}>
              {tripDetils.seats.map((seat, i) => {
                return (
                  <Grid
                    item
                    xs={6}
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        color: seat.status ? "red" : "main",
                        cursor: seat.status ? "not-allowed" : "pointer",
                        position: "relative",
                        fontWight: "bolder",
                      }}
                      onClick={() => {
                        // check if seat is not booked
                        if (!seat.status) {
                          bookTrip(seat.seatNumber);
                        }
                      }}
                    >
                      <WeekendIcon
                        sx={{
                          display: "inline-block",
                          fontSize: "60px",
                        }}
                      />
                      <Typography
                        sx={{
                          position: "absolute",
                          bottom: "-15px",
                          left: "40%",
                          fontSize: "12px",
                        }}
                      >
                        {i + 1}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
