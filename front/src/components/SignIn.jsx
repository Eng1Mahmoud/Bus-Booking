import * as React from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import background from "../assets/sinin.jpg";
import { Formik, Form } from "formik";
import Cookies from "js-cookie";
import axios from "axios";

const initialValues = {
  email: "",
  password: "",
};

const validate = (values) => {
  const errors = {};
  if (!values.email) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }

  if (!values.password) {
    errors.password = "Required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  return errors;
};

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" to="/">
    Tazkarty
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [exist, setExist] = React.useState({ exist: null, message: "" });
  const onSubmit = (values, { resetForm }) => {
    setLoading(true);
    axios
      .post("https://booking-bus.onrender.com/login/", values, {
        "content-type": "application/json",
      })
      .then((res) => {
        Cookies.set("token", res.data.token);

        if (res.data.exist) {
          setTimeout(() => {
            setLoading(false);
            resetForm();
            navigate("/");
          }, 1000);
        } else {
          setTimeout(() => {
            setLoading(false);
            setExist({ exist: false, message: res.data.message });
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    resetForm();
  };
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          p: [0, 6],
          height: ["100vh","100vh","103vh"],
          backgroundColor: "#1a66b999",
          direction: "ltr",
        }}
      >
        <Grid container sx={{ height: ["100%","100%","80%"] }}>
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: `url(${background})`,
              backgroundRepeat: "no-repeat",
              backgroundColor: (t) =>
                t.palette.mode === "light"
                  ? t.palette.grey[50]
                  : t.palette.grey[900],
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderTopLeftRadius: ["0px", "30px"],
              borderBottomLeftRadius: ["0px", "30px"],
            }}
          />
          <Grid
            item
            xs={12}
            sm={8}
            md={5}
            component={Paper}
            elevation={6}
            sx={{
              borderTopRightRadius: ["0px", "30px"],
              borderBottomRightRadius: ["0px", "30px"],
            }}
          >
            <Box
              sx={{
                my: 5,
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" mb={2}>
                Sign in
              </Typography>
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
                 
                }) => (
                  <Form>
                    <TextField
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && errors.email ? true : false}
                      helperText={
                        touched.email && errors.email ? errors.email : ""
                      }
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      error={touched.password && errors.password ? true : false}
                      helperText={
                        touched.password && errors.password
                          ? errors.password
                          : ""
                      }
                      autoComplete="current-password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    <Typography variant="body1" sx={{ color: "red" }}>
                      {exist.exist ? "" : exist.message}
                    </Typography>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      disabled={loading}
                      startIcon={loading && <CircularProgress size={20} />}
                    >
                      Sign In
                    </Button>
                    <Grid container>
                      <Grid item xs={12}>
                        <Link to="/register" variant="body2" style={{ textDecoration:"none",fontSize:"20px" }}>
                        Don't have an account? <strong style={{color: "blue"}}>Sign Up</strong>
                        </Link>
                      </Grid>
                    </Grid>
                    <Copyright sx={{ mt: 5 }} />
                  </Form>
                )}
              </Formik>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
