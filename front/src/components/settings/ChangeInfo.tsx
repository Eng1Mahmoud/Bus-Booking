import { Container, TextField, Button, Grid, Box } from "@mui/material";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import type { FormikErrors } from "formik";
import type { UserProfile } from "@/types";
import Cookies from "js-cookie";
import { useState } from "react";
import { useTranslation } from "react-i18next";
interface FormValues {
  FName: string;
  LName: string;
  email: string;
}

interface ChangeInfoProps {
  oldInformation: UserProfile;
}

const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};
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
export const ChangeInfo = ({ oldInformation }: ChangeInfoProps) => {
  const [newInformation, setNewInformation] = useState<UserProfile | null>(null);
  const { t } = useTranslation();
  const initialValues: FormValues = {
    FName: newInformation?.FName ?? oldInformation.FName,
    LName: newInformation?.LName ?? oldInformation.LName,
    email: newInformation?.email ?? oldInformation.email,
  };
  const handleSubmit = async (values: FormValues) => {
    try {
      const res = await axios.post(
        "https://booking-bus.onrender.com/updateInfo/",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${Cookies.get("token")}`,
          },
        },
      );
      setNewInformation(res.data.result);
    } catch {
      // Surfaced to the user in Phase 7, alongside the react-hook-form rewrite.
    }
  };

  return (
    <Container sx={{ paddingY: "50px" }}>
      <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                    helperText={touched.FName && errors.FName ? errors.FName : ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="LName"
                    name="LName"
                    label={t("Last Name")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.LName && errors.LName ? true : false}
                    helperText={touched.LName && errors.LName ? errors.LName : ""}
                  />
                </Grid>
                <Grid size={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="email"
                    name="email"
                    label={t("Email")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && errors.email ? true : false}
                    helperText={touched.email && errors.email ? errors.email : ""}
                  />
                </Grid>
                <Grid size={12}>
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
