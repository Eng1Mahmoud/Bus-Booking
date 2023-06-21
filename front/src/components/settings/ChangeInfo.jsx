import { Container, TextField, Button, Grid, Box } from "@mui/material";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import Cookies from "js-cookie";
import { useState } from "react";
import { useTranslation } from "react-i18next";
const validate = (values) => {
  const errors = {};
  if (!values.FName) {
    errors.FName = "Required";
  }

  if (!values.LName) {
    errors.LName = "Required";
  }

  if (!values.email) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  return errors;
};
export const ChangeInfo = ({ oldInformation }) => {
  const [newInformation, setNewInformation] = useState("");
  const { t } = useTranslation();
  const initialValues = {
    FName: newInformation.FName ? newInformation.FName : oldInformation.FName,
    LName: newInformation.LName ? newInformation.LName : oldInformation.LName,
    email: newInformation.email ? newInformation.email : oldInformation.email,
  };
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const res = await axios.post(
        "https://booking-bus.onrender.com/updateInfo/",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setNewInformation(res.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Container sx={{ paddingY: "50px" }}>
      <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
        }) => (
          <Form>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="FName"
                    name="FName"
                    value={values.FName}
                    label={t("First Name")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.FName && errors.FName ? true : false}
                    helperText={
                      touched.FName && errors.FName ? errors.FName : ""
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="LName"
                    name="LName"
                    label={t("Last Name")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.LName && errors.LName ? true : false}
                    helperText={
                      touched.LName && errors.LName ? errors.LName : ""
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="email"
                    name="email"
                    label={t("Email")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && errors.email ? true : false}
                    helperText={
                      touched.email && errors.email ? errors.email : ""
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="secondary"
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                  >
                    {t("Save")}
                  </Button>{" "}
                </Grid>
              </Grid>
            </Box>
          </Form>
        )}
      </Formik>
    </Container>
  );
};
