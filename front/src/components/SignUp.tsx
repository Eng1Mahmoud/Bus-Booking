import type { TypographyProps } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Link, useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import background from "../assets/sinin.jpg";
import { Formik, Form } from "formik";
import type { FormikErrors, FormikHelpers } from "formik";
import { authService } from "@/services/authService";
import { CircularProgress } from "@mui/material";
import { useState } from "react";

const initialValues = {
  FName: "",
  LName: "",
  email: "",
  password: "",
};

type FormValues = typeof initialValues;
const validate = (values: FormValues) => {
  const errors: FormikErrors<FormValues> = {};

  if (!values.FName) {
    errors.FName = "Please enter first name";
  }
  if (!values.LName) {
    errors.LName = "Please enter last name";
  }
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

function Copyright(props: TypographyProps) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
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

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [exist, setExist] = useState({ exist: false, message: "" });
  const navigate = useNavigate();
  const onSubmit = (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
    setLoading(true);
    authService
      .register(values)
      .then((res) => {
        sessionStorage.setItem("pendingEmail", values.email);
        if (res.exist) {
          setTimeout(() => {
            setLoading(false);
            setExist({ exist: true, message: res.message });
            resetForm();
          }, 1000);
        } else {
          setTimeout(() => {
            setLoading(false);
            navigate("/verification");
          }, 1000);
        }
      })
      .catch(() => {});

    resetForm();
  };
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          p: [0, 6],
          height: ["100vh", "100vh", "110vh"],
          backgroundColor: "#1a66b999",
          direction: "ltr",
        }}
      >
        <Grid container sx={{ height: ["100%", "100%", "80%"] }}>
          <CssBaseline />

          <Grid
            size={{ xs: 12, sm: 8, md: 5 }}
            component={Paper}
            sx={{
              borderTopLeftRadius: ["0px", "30px"],
              borderBottomLeftRadius: ["0px", "30px"],
            }}
          >
            <Box
              sx={{
                mx: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5" sx={{ pb: 2 }}>
                Sign Up
              </Typography>
              <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validate={validate}
              >
                {({ values, errors, touched, handleChange, handleBlur }) => (
                  <Form>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          id="FName"
                          label="First Name"
                          name="FName"
                          value={values.FName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.FName && errors.FName ? true : false}
                          helperText={touched.FName && errors.FName ? errors.FName : ""}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          id="LName"
                          label="Last Name"
                          name="LName"
                          value={values.LName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.LName && errors.LName ? true : false}
                          helperText={touched.LName && errors.LName ? errors.LName : ""}
                        />
                      </Grid>
                      <Grid size={12}>
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
                          helperText={touched.email && errors.email ? errors.email : ""}
                        />
                      </Grid>
                      <Grid size={12}>
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
                            touched.password && errors.password ? errors.password : ""
                          }
                          autoComplete="current-password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Grid>
                    </Grid>
                    <Typography variant="body1" sx={{ color: "red" }}>
                      {exist.exist ? exist.message : ""}
                    </Typography>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ my: 2 }}
                      disabled={loading}
                      startIcon={loading && <CircularProgress size={20} />}
                    >
                      Sign Up
                    </Button>
                    <Grid container sx={{ justifyContent: "flex-end" }}>
                      <Grid>
                        <Link
                          to="/login"
                          style={{ textDecoration: "none", fontSize: "20px" }}
                        >
                          Already have an account?{" "}
                          <strong style={{ color: "blue" }}>Sign in</strong>
                        </Link>
                      </Grid>
                    </Grid>
                    <Copyright sx={{ mt: 3, pb: 3 }} />
                  </Form>
                )}
              </Formik>
            </Box>
          </Grid>
          <Grid
            size={{ xs: false, sm: 4, md: 7 }}
            sx={{
              backgroundImage: `url(${background})`,
              backgroundRepeat: "no-repeat",
              backgroundColor: (t) =>
                t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderTopRightRadius: "30px",
              borderBottomRightRadius: "30px",
            }}
          />
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
