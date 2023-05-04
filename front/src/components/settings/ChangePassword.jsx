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
import axios from "axios";
import Cookies from "js-cookie";
const initialValues = {
  password: "",
  newPassword: "",
};
const validate = (values) => {
  const errors = {};
  if (values.password && !values.password) {
    errors.password = "Required";
  } else if (values.password && values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return errors;
};

export const ChangePassword = () => {
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState({});
  const handleSubmit = async (values,{resetForm}) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/changePassword/",
        values,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      resetForm();
      setOpen(true);
      setResult(res.data.result);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box>
      <Container maxWidth="md">
      <Snackbar
       anchorOrigin={{ vertical: "top", horizontal: "center"}}
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
   
      >
         <SnackbarContent sx={{ backgroundColor: result.match?"green":"red"}} message={result.message} />
      </Snackbar>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form>
              <Box>
                <Grid container spacing={2} sx={{ py: 5 }}>
                  <Grid item xs={12}>
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
                        touched.password && errors.password
                          ? errors.password
                          : ""
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      label="New Password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.newPassword && errors.newPassword ? true : false
                      }
                      helperText={
                        touched.newPassword && errors.newPassword
                          ? errors.newPassword
                          : ""
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
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
