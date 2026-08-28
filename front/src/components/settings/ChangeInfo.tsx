import { Container } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Form } from "@/components/forms/Form";
import { InputField } from "@/components/forms/InputField";
import { profileSchema, type ProfileValues } from "@/schemas";
import { userService } from "@/services/userService";
import { queryKeys } from "@/api/queryClient";
import type { UserProfile } from "@/types";

interface ChangeInfoProps {
  oldInformation: UserProfile;
}

export const ChangeInfo = ({ oldInformation }: ChangeInfoProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const onSubmit = async (values: ProfileValues) => {
    await userService.updateProfile(values);
    // The navbar reads the same query, so its name and avatar follow.
    await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
  };

  return (
    <Container maxWidth="sm">
      <Form
        schema={profileSchema}
        defaultValues={{
          FName: oldInformation.FName,
          LName: oldInformation.LName,
          email: oldInformation.email,
        }}
        onSubmit={onSubmit}
        submitLabel={t("Save")}
      >
        <InputField name="FName" label={t("First Name")} autoComplete="given-name" />
        <InputField name="LName" label={t("Last Name")} autoComplete="family-name" />
        <InputField name="email" label={t("Email")} type="email" autoComplete="email" />
      </Form>
    </Container>
  );
};

export default ChangeInfo;
