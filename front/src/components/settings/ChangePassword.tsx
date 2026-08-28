import { useState } from "react";
import { Alert, Container, Snackbar } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Form } from "@/components/forms/Form";
import { InputField } from "@/components/forms/InputField";
import { changePasswordSchema, type ChangePasswordValues } from "@/schemas";
import { userService } from "@/services/userService";

export const ChangePassword = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<{
    open: boolean;
    ok: boolean;
    message: string;
  }>({ open: false, ok: false, message: "" });
  const [error, setError] = useState<string>();

  const onSubmit = async (values: ChangePasswordValues) => {
    setError(undefined);
    const result = await userService.changePassword(values);

    // A wrong current password comes back as `match: false` on a 200, so it is
    // data to check rather than an error to catch.
    if (!result.match) {
      setError(result.message);
      return;
    }

    setFeedback({ open: true, ok: true, message: result.message });
  };

  return (
    <Container maxWidth="sm">
      <Form
        schema={changePasswordSchema}
        defaultValues={{ password: "", newPassword: "" }}
        onSubmit={onSubmit}
        submitLabel={t("Save")}
        error={error}
        resetOnSuccess
      >
        <InputField
          name="password"
          label={t("Current Password")}
          type="password"
          autoComplete="current-password"
        />
        <InputField
          name="newPassword"
          label={t("New Password")}
          type="password"
          autoComplete="new-password"
        />
      </Form>

      <Snackbar
        open={feedback.open}
        autoHideDuration={5000}
        onClose={() => setFeedback((f) => ({ ...f, open: false }))}
      >
        <Alert severity={feedback.ok ? "success" : "error"}>{feedback.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ChangePassword;
