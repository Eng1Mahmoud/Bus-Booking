import { useState } from "react";
import { Box } from "@mui/material";
import { Formik, Form } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const initialValues = {
  verificationCode: "",
  password: "",
};

const validate = (values) => {
  const errors = {};

  if (!values.verificationCode) {
    errors.verificationCode = "Please Enter Your verification Code";
  }
  if (!values.password) {
    errors.password = "Please Enter Your New Password";
  }
  return errors;
};
export const NewPassword = () => {
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState({ status: false, message: "" });
  const navigate = useNavigate();
  const onSubmit = (values, { resetForm }) => {
    setLoading(true);

    axios
      .post("https://booking-bus.onrender.com/newPassword", values, {
        "content-type": "application/json",
      })
      .then((res) => {
      
        setLoading(false);
        setUpdate({ status: res.data.verification, message: res.data.message });
      })
      .catch((err) => {
        console.log(err);
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
        {!update.status ? (
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validate={validate}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                <TextField
                  sx={{ mb: 2 }}
                  fullWidth
                  id="verificationCode"
                  label="Enter verification Code "
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

                <TextField
                  fullWidth
                  id="password"
                  label="Enter New Password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password ? true : false}
                  helperText={
                    touched.password && errors.password ? errors.password : ""
                  }
                />
                {!update.status && (
                  <span style={{ color: "red" }}>{update.message}</span>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ my: 2 }}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Save New Password
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <Box>
            <h1>password Updated successfuly!</h1>

            <Button
              variant="contained"
              sx={{ marginTop: "10px" }}
              onClick={() => navigate("/login")}
            >
              Return to Login Page
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};
