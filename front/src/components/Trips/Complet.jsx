import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useTranslation } from "react-i18next";
export default function Complet({ opens }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(opens);

  useEffect(() => {
    setOpen(opens);
  }, [opens]);

  const handleClose = () => {
    setOpen(false);
    navigate("/");
  };

  return (
    <Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Congratulation
          <AutoAwesomeIcon sx={{ color: "yellow", ml: "5px", mt: "5px" }} />
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t(
              "Congratulation your trip is booked. Thank you for booking with Tazkarty Company"
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            {t("Ok")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
