import { useState } from "react";
import { Box } from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikErrors } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
const initialValues = {
  email: "",
};

type FormValues = typeof initialValues;

const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};

  if (!values.email) {
    errors.email = "Please Enter Your Email";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  return errors;
};
export const ForgetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onSubmit = (values: FormValues) => {
    setLoading(true);

    authService
      .forgotPassword(values.email)
      .then((res) => {
        setLoading(false);
        if (res.send) {
          navigate("/NewPassword");
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };
  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#ffffff70",
      }}
    >
      <Box>
        <Formik initialValues={initialValues} onSubmit={onSubmit} validate={validate}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <TextField
                fullWidth
                id="email"
                label="Enter Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email ? true : false}
                helperText={touched.email && errors.email ? errors.email : ""}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ my: 2 }}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Reset Password"
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};
