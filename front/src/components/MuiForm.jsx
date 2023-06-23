import React from "react";
import dayjs from "dayjs";
import { Formik, Form, Field } from "formik";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  MenuItem,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import { Select } from "formik-mui";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { activeTrips } from "../redux/slices/TripsSlice";
import { useTranslation } from "react-i18next";
const StyledField = styled(Field)`
  .MuiFormLabel-root {
    color: "text.main";
    text-align: left;
  }
  .MuiSelect-select {
    color: "text.main";
  }
`;
const initialValues = {
  from: "",
  to: "",
  date: new Date(),
};

const validate = (values) => {
  const errors = {};
  return errors;
};

const countries = [
  { name: "Hurghada", title: true },
  { name: "El Nasr Street", title: false },
  { name: "Watanya-HRG", title: false },
  { name: "Al Ahyaa", title: false },
  { name: "Giza/Cairo", title: true },
  { name: "6 October - El Hussary", title: false },
  { name: "Ramsis", title: false },
  { name: "Alexandria", title: true },
  { name: "Sidi Gaber", title: false },
  { name: "Moharam Bek", title: false },
  { name: "Dahab", title: true },
  { name: "Dahab", title: false },
  { name: "Sohag", title: true },
  { name: "Dar ElTeb", title: false },
  { name: "El Ray", title: false },
  { name: "Sharm El Sheikh", title: true },
  { name: "Watanya-SSH", title: false },
  { name: "El Ruwaysat", title: false },
  { name: "Luxor", title: true },
  { name: "Railway station", title: false },
  { name: "Armant", title: false },
  { name: "Qena", title: true },
  { name: "Qift", title: false },
  { name: "Qena ", title: false },
  { name: "Asyout", title: true },
  { name: "Elmoalmien", title: false },
  { name: "ELHILALEY", title: false },
];

const MuiForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const today = new Date();
  const addTrips = (trips) => dispatch(activeTrips(trips));
  const onSubmit = (values, { resetForm }) => {
    setLoading(true);
    const formattedDate = dayjs(values.date).format("YYYY-M-D");
    const data = { ...values, date: formattedDate };

    axios
      .post("https://booking-bus.onrender.com/search/", data, {
        "content-type": "application/json",
      })
      .then((res) => {
        addTrips(res.data);
        navigate("/trips");
        setLoading(false);
      });
    resetForm();
  };
  return (
    <Stack
      spacing={2}
      sx={{
        position: "absolute",
        top: "0px",
        left: "0%",
        right: "0px",
        bottom: "0px",
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
          "@media (max-width: 600px)": {
            width: "100%",
            padding: "5px",
          },
        }}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validate={validate}
        >
          {({ setFieldValue, errors, submitForm, touched, values }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Form>
                <Grid
                  container
                  spacing={2}
                  p={3}
                  justifyContent="center"
                  alignItems="end"
                >
                  <Grid item xs={12} md={3}>
                    <Paper
                      elevation={10}
                      sx={{
                        backgroundColor: [
                          "background.main",
                          "background.main",
                          "transparent",
                        ],
                        padding: "10px",
                      }}
                    >
                      <StyledField
                       fullWidth
                        component={Select}
                        id="from"
                        name="from"
                        label={t("From")}
                      >
                        {countries.map((city, i) => {
                          return (
                            <MenuItem
                              fullWidth={true}
                              key={city.name + i}
                              value={city.name}
                              disabled={city.title}
                              sx={{ minWidth: "300px" }}
                            >
                              {t(city.name)}
                            </MenuItem>
                          );
                        })}
                      </StyledField>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper
                      elevation={10}
                      sx={{
                        backgroundColor: [
                          "background.main",
                          "background.main",
                          "transparent",
                        ],
                        padding: "10px",
                      }}
                    >
                      <StyledField
                        fullWidth
                        component={Select}
                        id="to"
                        name="to"
                        label={t("To")}
                      >
                        {countries.map((city, i) => {
                          return (
                            <MenuItem
                            fullWidth={true}
                              key={city.name + i}
                              value={city.name}
                              disabled={city.title}
                              sx={{ minWidth: "300px" }}
                            >
                              {t(city.name)}
                            </MenuItem>
                          );
                        })}
                      </StyledField>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper
                      elevation={10}
                      sx={{
                        backgroundColor: [
                          "background.main",
                          "background.main",
                          "transparent",
                        ],
                        padding: "10px",
                      }}
                    >
                      <StyledField
                        fullWidth
                        name="date"
                        as={DatePicker}
                        label={t("Date of Travel")}
                        value={values.date}
                        minDate={today}
                        onChange={(newDate) => setFieldValue("date", newDate)}
                        error={Boolean(errors.date && touched["date"])}
                        helperText={errors.date}
                        renderInput={(params) => <TextField   fullWidth {...params} />}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      variant="contained"
                      size="large"
                      type="submit"
                      startIcon={loading && <CircularProgress size={20} />}
                      sx={{
                        fontSize: "25px",
                        color: "text.therd",
                        backgroundColor: "background.therd",
                      }}
                    >
                      {t("Search")}{" "}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            </LocalizationProvider>
          )}
        </Formik>
      </Paper>
    </Stack>
  );
};

export default MuiForm;
