import { TextField } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * A text input bound to the surrounding form by name.
 *
 * Two things here are easy to get wrong and were, at first:
 *
 * `formState` read off `useFormContext()` is a proxy that only re-renders the
 * component that called `useForm`. A child reading `errors` from it sees the
 * value at first render and never updates, so validation messages never appear.
 * `useFormState({ name })` subscribes this field to its own error and nothing
 * else, so a keystroke in one field does not re-render the others.
 *
 * And MUI's TextField sends `ref` to its root `<div>`, so spreading
 * `register()` wholesale leaves react-hook-form holding the wrapper rather than
 * the input. `inputRef` is the prop that reaches the real element.
 */
export const InputField = ({
  name,
  label,
  type = "text",
  autoComplete,
  autoFocus,
}: InputFieldProps) => {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control, name });

  const { ref, ...field } = register(name);
  const message = errors[name]?.message;

  return (
    <TextField
      {...field}
      inputRef={ref}
      fullWidth
      margin="normal"
      id={name}
      label={label}
      type={type}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      error={Boolean(message)}
      // A non-breaking space keeps the field's height stable, so the form does
      // not jump as messages appear and clear.
      helperText={typeof message === "string" ? message : " "}
    />
  );
};

export default InputField;
