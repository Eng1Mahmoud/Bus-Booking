/* eslint-disable react-hooks/exhaustive-deps */
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import WeekendIcon from "@mui/icons-material/Weekend";
import { errorMessage } from "@/api/client";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Complet from "./Complet";
import { useTranslation } from "react-i18next";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type Ref,
} from "react";
import type { TransitionProps } from "@mui/material/transitions";
import type { TripDetails } from "@/types";

const TransitionInner = function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
};

// React 19 takes `ref` as an ordinary prop, so forwardRef is no longer needed;
// MUI still expects a component it can hand a ref to.
const Transition = forwardRef(TransitionInner);

interface BookProps {
  tripDetils: TripDetails;
}

export default function Book({ tripDetils }: BookProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPide, setShowPide] = useState(false);
  const [open, setOpen] = useState(false);
  const [openComplet, setOpenComplet] = useState(false);
  const [seatNumber, setSeatNumber] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const paypalRef = useRef<HTMLDivElement | null>(null);

  const seatSelection = () => ({
    from: tripDetils.from,
    to: tripDetils.to,
    date: tripDetils.date,
    busNumber: tripDetils.busNumber,
    seatNumber: seatNumber as number,
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
    let createdOrderId: string | null = null;
    paypalRef.current.innerHTML = "";

    const buttons = window.paypal.Buttons({
      createOrder: async () => {
        setError("");
        const order = await paymentService.createOrder(seatSelection());
        createdOrderId = order.orderId;
        return order.orderId;
      },

      onApprove: async (data: { orderID: string }) => {
        setBusy(true);
        try {
          await paymentService.captureOrder(data.orderID);
          if (cancelled) return;
          setOpen(false);
          setShowPide(false);
          setOpenComplet(true);
        } catch (err) {
          setError(
            errorMessage(
              err,
              t("We could not confirm your payment. Please contact support."),
            ),
          );
        } finally {
          setBusy(false);
        }
      },

      // Releases the seat hold so an abandoned checkout does not take the seat
      // off sale until its ten-minute hold lapses.
      onCancel: () => {
        if (!createdOrderId) return;
        void paymentService.cancelOrder(createdOrderId).catch(() => {});
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

  const bookTrip = (selectedSeat: number) => {
    if (!isAuthenticated) {
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
        slots={{ transition: Transition }}
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
              {tripDetils.seats.map((seat, i: number) => {
                return (
                  <Grid
                    size={6}
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
