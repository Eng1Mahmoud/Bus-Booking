import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form";
import type { ZodType } from "zod";
import { Alert, Box } from "@mui/material";
import { useState, type ReactNode } from "react";
import { SubmitButton } from "./SubmitButton";

interface FormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  submitLabel: string;
  /** Cleared on the next submit. Set from the caller for server-side errors. */
  error?: string;
  resetOnSuccess?: boolean;
}

/**
 * The shared form shell, matching the portfolio's `components/forms/Form.tsx`.
 *
 * It owns three things every form here repeated by hand: validation wiring, the
 * pending state of the submit button, and surfacing the error. Eight components
 * each carried their own `loading` flag, their own `setTimeout(…, 1000)` before
 * navigating, and — in six of them — an empty `.catch(() => {})` that swallowed
 * failures silently, so a wrong password looked identical to a dead server.
 */
export const Form = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  submitLabel,
  error,
  resetOnSuccess = false,
}: FormProps<T>) => {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    // Validate on blur, then live once a field has been corrected — errors
    // appear when a field is finished, not on the first keystroke.
    mode: "onTouched",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handle: SubmitHandler<T> = async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      if (resetOnSuccess) methods.reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const message = error ?? submitError;

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        noValidate
        onSubmit={methods.handleSubmit(handle)}
        sx={{ width: "100%" }}
      >
        {message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {children}
        <SubmitButton label={submitLabel} />
      </Box>
    </FormProvider>
  );
};

export default Form;
