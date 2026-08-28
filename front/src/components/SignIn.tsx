import {
  Avatar,
  Box,
  CssBaseline,
  Grid,
  Paper,
  Typography,
  type TypographyProps,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import background from "@/assets/sinin.jpg";
import { useState } from "react";

import { Form } from "@/components/forms/Form";
import { InputField } from "@/components/forms/InputField";
import { loginSchema, type LoginValues } from "@/schemas";
import { authService } from "@/services/authService";

function Copyright(props: TypographyProps) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" to="/">
        Tazkarty
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  // ProtectedRoute records the page that bounced them here.
  const { state } = useLocation() as { state?: { from?: string } };
  const [error, setError] = useState<string>();

  const onSubmit = async (values: LoginValues) => {
    const result = await authService.login(values);

    // The API answers 200 with `exist: false` for a bad credential rather than
    // a 401, so a failure arrives as data and has to be checked, not caught.
    if (!result.exist) {
      setError(result.message);
      return;
    }

    // No artificial delay. Every one of these forms used to sit on a
    // setTimeout(…, 1000) before navigating.
    navigate(state?.from ?? "/", { replace: true });
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: [0, 6],
        height: ["100vh", "100vh", "103vh"],
        backgroundColor: "#1a66b999",
        direction: "ltr",
      }}
    >
      <Grid container sx={{ height: ["100%", "100%", "80%"] }}>
        <CssBaseline />
        <Grid
          size={{ xs: false, sm: 4, md: 7 }}
          sx={{
            backgroundImage: `url(${background})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderTopLeftRadius: ["0px", "30px"],
            borderBottomLeftRadius: ["0px", "30px"],
          }}
        />
        <Grid
          size={{ xs: 12, sm: 8, md: 5 }}
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
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Sign in
            </Typography>

            <Form
              schema={loginSchema}
              defaultValues={{ email: "", password: "" }}
              onSubmit={onSubmit}
              submitLabel="Sign In"
              error={error}
            >
              <InputField
                name="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                autoFocus
              />
              <InputField
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
              />
            </Form>

            <Grid container>
              <Grid size={12}>
                <Link
                  to="/register"
                  style={{ textDecoration: "none", fontSize: "20px" }}
                >
                  Don&apos;t have an account?{" "}
                  <strong style={{ color: "blue" }}>Sign Up</strong>
                </Link>
              </Grid>
              <Grid size={12}>
                <Link
                  to="/ForgetPassword"
                  style={{ textDecoration: "none", fontSize: "20px" }}
                >
                  Forgot your password?
                </Link>
              </Grid>
            </Grid>
            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
