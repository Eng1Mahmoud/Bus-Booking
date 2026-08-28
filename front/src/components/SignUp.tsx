import {
  Avatar,
  Box,
  CssBaseline,
  Grid,
  Paper,
  Typography,
  type TypographyProps,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import background from "@/assets/sinin.jpg";
import { useState } from "react";

import { Form } from "@/components/forms/Form";
import { InputField } from "@/components/forms/InputField";
import { signUpSchema, type SignUpValues } from "@/schemas";
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

export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  const onSubmit = async (values: SignUpValues) => {
    const result = await authService.register(values);

    if (result.exist) {
      setError(result.message);
      return;
    }

    // Only the address travels on, as router state. The code is emailed and
    // checked server-side; the password never leaves this component.
    navigate("/verification", { state: { email: values.email } });
  };

  return (
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

            <Form
              schema={signUpSchema}
              defaultValues={{ FName: "", LName: "", email: "", password: "" }}
              onSubmit={onSubmit}
              submitLabel="Sign Up"
              error={error}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InputField
                    name="FName"
                    label="First Name"
                    autoComplete="given-name"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InputField
                    name="LName"
                    label="Last Name"
                    autoComplete="family-name"
                  />
                </Grid>
              </Grid>
              <InputField
                name="email"
                label="Email Address"
                type="email"
                autoComplete="email"
              />
              <InputField
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
              />
            </Form>

            <Grid container sx={{ justifyContent: "flex-end" }}>
              <Grid>
                <Link to="/login" style={{ textDecoration: "none", fontSize: "20px" }}>
                  Already have an account?{" "}
                  <strong style={{ color: "blue" }}>Sign in</strong>
                </Link>
              </Grid>
            </Grid>
            <Copyright sx={{ mt: 3, pb: 3 }} />
          </Box>
        </Grid>
        <Grid
          size={{ xs: false, sm: 4, md: 7 }}
          sx={{
            backgroundImage: `url(${background})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderTopRightRadius: "30px",
            borderBottomRightRadius: "30px",
          }}
        />
      </Grid>
    </Box>
  );
}
