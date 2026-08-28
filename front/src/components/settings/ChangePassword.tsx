import {
  Box,
  Button,
  Container,
  Grid,
  Snackbar,
  SnackbarContent,
  TextField,
} from "@mui/material";
import React from "react";
import { Formik, Form, Field } from "formik";
import type { FormikErrors, FormikHelpers } from "formik";
import { userService } from "@/services/userService";
const initialValues = {
  password: "",
  newPassword: "",
};

type FormValues = typeof initialValues;
const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};
  if (values.password && !values.password) {
    errors.password = "Required";
  } else if (values.password && values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
};

export const ChangePassword = () => {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<{
    match?: boolean;
    message?: string;
  }>({});
  const handleSubmit = async (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>,
  ) => {
    try {
      setResult(await userService.changePassword(values));
      setOpen(true);
      resetForm();
    } catch {
      setResult({ match: false, message: "Something went wrong" });
      setOpen(true);
    }
  };

  return (
    <Box>
      <Container maxWidth="md">
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
        >
          <SnackbarContent
            sx={{ backgroundColor: result.match ? "green" : "red" }}
            message={result.message}
          />
        </Snackbar>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Box>
                <Grid container spacing={2} sx={{ py: 5 }}>
                  <Grid size={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="password"
                      name="password"
                      type="password"
                      label="Current Password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && errors.password ? true : false}
                      helperText={
                        touched.password && errors.password ? errors.password : ""
                      }
                    />
                  </Grid>
                  <Grid size={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      label="New Password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.newPassword && errors.newPassword ? true : false}
                      helperText={
                        touched.newPassword && errors.newPassword
                          ? errors.newPassword
                          : ""
                      }
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button variant="contained" color="secondary" type="submit">
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          )}
        </Formik>
      </Container>
    </Box>
  );
};
