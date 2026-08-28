import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { Form } from "@/components/forms/Form";
import { InputField } from "@/components/forms/InputField";
import { verificationSchema, type VerificationValues } from "@/schemas";
import { authService } from "@/services/authService";

export const Verification = () => {
  const navigate = useNavigate();
  // Set by SignUp when it redirected here. The code is verified server-side;
  // only the address is needed to find the pending registration.
  const { state } = useLocation() as { state?: { email?: string } };
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = async (values: VerificationValues) => {
    const result = await authService.verifyEmail({
      verificationCode: values.verificationCode,
      email: state?.email ?? "",
    });

    if (!result.verification) {
      setError(result.message);
      return;
    }

    setVerified(true);
  };

  if (verified) {
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
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Verification successful
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Your account has been created. You can sign in now.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/login")}>
            Go to sign in
          </Button>
        </Box>
      </Box>
    );
  }

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
      <Box sx={{ width: 360, maxWidth: "90vw" }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Enter the code we emailed you
        </Typography>
        <Form
          schema={verificationSchema}
          defaultValues={{ verificationCode: "" }}
          onSubmit={onSubmit}
          submitLabel="Verify Email"
          error={error}
        >
          <InputField name="verificationCode" label="Verification code" autoFocus />
        </Form>
      </Box>
    </Box>
  );
};

export default Verification;
