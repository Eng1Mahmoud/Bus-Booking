import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Form } from "@/components/forms/Form";
import { SelectField } from "@/components/forms/SelectField";
import { DateField } from "@/components/forms/DateField";
import { searchSchema, type SearchValues } from "@/schemas";
import { STATIONS } from "@/constants/stations";
import { tripService } from "@/services/tripService";
import { useAppDispatch } from "@/store";
import { activeTrips } from "@/store/uiSlice";

const MuiForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const options = STATIONS.map((station) => ({
    value: station.name,
    label: t(station.name),
    disabled: station.isCity,
  }));

  const onSubmit = async (values: SearchValues) => {
    // `YYYY-M-D` with no zero padding is what the API stores and compares
    // against; a padded date silently matches nothing.
    const trips = await tripService.search({
      from: values.from,
      to: values.to,
      date: dayjs(values.date).format("YYYY-M-D"),
    });

    dispatch(activeTrips(trips));
    navigate("/trips");
  };

  return (
    <Stack
      spacing={2}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          color: "white",
          fontSize: "60px",
          fontWeight: "bolder",
          marginBottom: "20px",
          display: ["none", "none", "block"],
        }}
      >
        {t("Start Booking Your Trip")}
      </Typography>

      <Paper
        elevation={10}
        sx={{
          width: "80%",
          color: "text.main",
          padding: "20px",
          borderRadius: "20px",
          backgroundColor: ["transparent", "transparent", "background.main"],
          "@media (max-width: 600px)": { width: "100%", padding: "5px" },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Form
            schema={searchSchema}
            defaultValues={{ from: "", to: "", date: dayjs() }}
            onSubmit={onSubmit}
            submitLabel={t("Search")}
          >
            <Grid container spacing={2} sx={{ px: 2, alignItems: "start" }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <SelectField name="from" label={t("From")} options={options} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <SelectField name="to" label={t("To")} options={options} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <DateField name="date" label={t("Date of Travel")} />
              </Grid>
            </Grid>
          </Form>
        </LocalizationProvider>
      </Paper>
    </Stack>
  );
};

export default MuiForm;
