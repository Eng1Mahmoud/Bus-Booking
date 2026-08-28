import { Button, CircularProgress } from "@mui/material";
import { useFormState } from "react-hook-form";

/**
 * Reads its own pending state from the form rather than taking a prop.
 *
 * This is the React 19 `useFormStatus` idea; `useFormState` is react-hook-form's
 * equivalent and is what this codebase's forms already run on. Either way the
 * button is disabled for exactly as long as the submit is in flight, which the
 * hand-rolled `loading` flags got wrong: several set it true and only cleared it
 * on success, so one failed request disabled the button until a page reload.
 */
export const SubmitButton = ({ label }: { label: string }) => {
  const { isSubmitting } = useFormState();

  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      disabled={isSubmitting}
      startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
      sx={{ mt: 3, mb: 2 }}
    >
      {label}
    </Button>
  );
};
