import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller, useFormContext } from "react-hook-form";
import dayjs, { type Dayjs } from "dayjs";

/**
 * MUI's date pickers work in Dayjs objects. Handing them a native `Date` throws
 * inside `AdapterDayjs.isValid` and takes down the whole route, which is what
 * happened to the home page during the Phase 4 migration.
 */
export const DateField = ({ name, label }: { name: string; label: string }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          label={label}
          value={(field.value as Dayjs | null) ?? null}
          minDate={dayjs()}
          onChange={field.onChange}
          slotProps={{
            textField: {
              fullWidth: true,
              error: Boolean(fieldState.error),
              helperText: fieldState.error?.message ?? " ",
            },
          }}
        />
      )}
    />
  );
};
