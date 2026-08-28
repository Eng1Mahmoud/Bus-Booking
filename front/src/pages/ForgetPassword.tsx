import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { Form } from "@/components/forms/Form";
import { InputField } from "@/components/forms/InputField";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas";
import { authService } from "@/services/authService";

export const ForgetPassword = () => {
  const navigate = useNavigate();

  const onSubmit = async (values: ForgotPasswordValues) => {
    const result = await authService.forgotPassword(values.email);
    // The API answers identically whether or not the address is registered, so
    // this endpoint cannot be used to find out who has an account.
    navigate("/NewPassword", { state: { email: result.email } });
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
      <Box sx={{ width: 360, maxWidth: "90vw" }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Reset your password
        </Typography>
        <Form
          schema={forgotPasswordSchema}
          defaultValues={{ email: "" }}
          onSubmit={onSubmit}
          submitLabel="Send code"
        >
          <InputField
            name="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            autoFocus
          />
        </Form>
      </Box>
    </Container>
  );
};

export default ForgetPassword;
