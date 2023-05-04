import { useState } from "react";
import { Box } from "@mui/material";
import { Formik, Form } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const initialValues = {
  verificationCode: "",
};

const validate = (values) => {
  const errors = {};

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

  const onSubmit = (values, { resetForm }) => {
    setLoading(true);
    axios
      .post("http://localhost:4000/verification", values, {
        "content-type": "application/json",
      })
      .then((res) => {
        console.log(res);
        if (res.data.verification) {
          setTimeout(() => {
            setVerificationStatus({ verified: true, message: "" });
            setLoading(false);
            resetForm();
          }, 1000);
        } else {
          setVerificationStatus({ verified: false, message: res.data.message });
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
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
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validate={validate}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
              setFieldValue,
            }) => (
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
                    touched.verificationCode && errors.verificationCode
                      ? true
                      : false
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
              onClick={() => navigate("/signin")}
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
