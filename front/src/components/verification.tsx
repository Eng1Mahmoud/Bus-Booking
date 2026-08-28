import { useState } from "react";
import { Box } from "@mui/material";
import { Formik, Form } from "formik";
import type { FormikErrors, FormikHelpers } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const initialValues = {
  verificationCode: "",
};

type FormValues = typeof initialValues;

const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};

  if (!values.verificationCode) {
    errors.verificationCode = "Please enter verification Code";
  }

  return errors;
};
export const Verification = () => {
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    verified: false,
    message: "",
  });
  const navigate = useNavigate();

  const onSubmit = (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
    setLoading(true);

    authService
      .verifyEmail({
        verificationCode: values.verificationCode,
        // Set by SignUp. The code itself is checked server-side; only the
        // address is needed to find the pending registration.
        email: sessionStorage.getItem("pendingEmail") ?? "",
      })
      .then((res) => {
        if (res.verification) {
          setTimeout(() => {
            setVerificationStatus({ verified: true, message: "" });
            setLoading(false);
            resetForm();
          }, 1000);
        } else {
          setVerificationStatus({ verified: false, message: res.message });
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      })
      .catch(() => {
        setVerificationStatus({
          verified: false,
          message: "Error verifying the code. Please try again.",
        });
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#ffffff70",
      }}
    >
      <Box>
        {!verificationStatus.verified ? (
          <Formik initialValues={initialValues} onSubmit={onSubmit} validate={validate}>
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                <TextField
                  fullWidth
                  id="verificationCode"
                  label=" verification Code"
                  name="verificationCode"
                  value={values.verificationCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.verificationCode && errors.verificationCode ? true : false
                  }
                  helperText={
                    touched.verificationCode && errors.verificationCode
                      ? errors.verificationCode
                      : ""
                  }
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ my: 2 }}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Verify Email
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Box>
            <h1>Verification successful!</h1>
            <p>Congratulations! Your account has been verified.</p>
            <Button
              variant="contained"
              sx={{ marginTop: "10px" }}
              onClick={() => navigate("/login")}
            >
              Return to Login Page
            </Button>
          </Box>
        )}
        {verificationStatus.message && (
          <Box>
            <h1>Verification failed!</h1>
          </Box>
        )}
      </Box>
    </Box>
  );
};
