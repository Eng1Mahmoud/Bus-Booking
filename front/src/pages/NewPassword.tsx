import { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { Form } from "@/components/forms/Form";
import { InputField } from "@/components/forms/InputField";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas";
import { authService } from "@/services/authService";

export const NewPassword = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { email?: string } };
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = async (values: ResetPasswordValues) => {
    const result = await authService.resetPassword({
      email: state?.email ?? "",
      password: values.password,
      verificationCode: values.verificationCode,
    });

    if (!result.verification) {
      setError(result.message);
      return;
    }

    setDone(true);
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
      <Box sx={{ width: 360, maxWidth: "90vw", textAlign: "center" }}>
        {done ? (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Password updated
            </Typography>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Go to sign in
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Choose a new password
            </Typography>
            <Form
              schema={resetPasswordSchema}
              defaultValues={{ verificationCode: "", password: "" }}
              onSubmit={onSubmit}
              submitLabel="Update password"
              error={error}
            >
              <InputField name="verificationCode" label="Verification code" autoFocus />
              <InputField
                name="password"
                label="New password"
                type="password"
                autoComplete="new-password"
              />
            </Form>
          </>
        )}
      </Box>
    </Container>
  );
};

export default NewPassword;
