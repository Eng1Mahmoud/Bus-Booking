/* eslint-disable react-hooks/exhaustive-deps */
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import WeekendIcon from "@mui/icons-material/Weekend";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Complet from "./Complet";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

const API = process.env.REACT_APP_API_URL || "https://booking-bus.onrender.com";

const Transition = function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
};

export default function Book({ tripDetils }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPide, setShowPide] = useState(false);
  const [open, setOpen] = useState(false);
  const [openComplet, setOpenComplet] = useState(false);
  const [seatNumber, setSeatNumber] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const paypalRef = useRef(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    authorization: `Bearer ${Cookies.get("token")}`,
  });

  const seatSelection = () => ({
    from: tripDetils.from,
    to: tripDetils.to,
    date: tripDetils.date,
    busNumber: tripDetils.busNumber,
    seatNumber,
  });

  /**
   * The PayPal buttons no longer decide anything.
   *
   * Previously this component created the order in the browser with a price it
   * chose, and on approval told the API "this is booked" — so the payment could
   * be skipped entirely by calling the API directly. Now the server creates the
   * order (picking the price from the trip itself) and captures it; the browser
   * only ever handles an opaque order id.
   */
  useEffect(() => {
    if (!showPide || !seatNumber || !window.paypal || !paypalRef.current) return;

    let cancelled = false;
    let createdOrderId = null;
    paypalRef.current.innerHTML = "";

    const buttons = window.paypal.Buttons({
      createOrder: async () => {
        setError("");
        const { data } = await axios.post(
          `${API}/api/payments/orders`,
          seatSelection(),
          { headers: authHeaders() },
        );
        createdOrderId = data.orderId;
        return data.orderId;
      },

      onApprove: async (data) => {
        setBusy(true);
        try {
          await axios.post(
            `${API}/api/payments/orders/${data.orderID}/capture`,
            {},
            { headers: authHeaders() },
          );
          if (cancelled) return;
          setOpen(false);
          setShowPide(false);
          setOpenComplet(true);
        } catch (err) {
          setError(
            err?.response?.data?.message ||
              t("We could not confirm your payment. Please contact support."),
          );
        } finally {
          setBusy(false);
        }
      },

      // Releases the seat hold so an abandoned checkout does not take the seat
      // off sale until its ten-minute hold lapses.
      onCancel: () => {
        if (!createdOrderId) return;
        axios
          .post(
            `${API}/api/payments/orders/${createdOrderId}/cancel`,
            {},
            { headers: authHeaders() },
          )
          .catch(() => {});
        setShowPide(false);
      },

      onError: () => {
        setError(t("Something went wrong with the payment. Please try again."));
      },
    });

    buttons.render(paypalRef.current);

    // Without this the previous button instance stayed mounted and a second
    // one was rendered on every price change.
    return () => {
      cancelled = true;
      buttons.close?.();
    };
  }, [showPide, seatNumber]);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setShowPide(false);
    setError("");
  };

  const bookTrip = (selectedSeat) => {
    if (!Cookies.get("token")) {
      navigate("/login");
      return;
    }
    setSeatNumber(selectedSeat);
    setError("");
    setShowPide(true);
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {showPide ? (
            <Box>
              {busy && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
              <Box ref={paypalRef} />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {tripDetils.seats.map((seat, i) => {
                return (
                  <Grid
                    item
                    xs={6}
                    key={seat.seatNumber ?? i}
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
                        {seat.seatNumber ?? i + 1}
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
