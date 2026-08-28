import { MenuItem, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

export interface SelectOption {
  value: string;
  label: string;
  /** Group headings are shown but cannot be chosen. */
  disabled?: boolean;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
}

/**
 * `Controller` rather than `register`: MUI's Select reports changes through its
 * own onChange with a non-standard event, which a plain `register` misses.
 */
export const SelectField = ({ name, label, options }: SelectFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          select
          fullWidth
          label={label}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? " "}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value + String(option.disabled)}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};
