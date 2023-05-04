import { Box } from "@mui/material";
import React from "react";
import { SubHero } from "../components/general/SubHero";
import { Settings } from "../components/settings/ChangeInfo";
import TabsEdit from "../components/settings/TabsEdit";
import settingsImage from "../assets/settings.jpg";
export const SettingsPage = () => {
  return (
    <Box>
      <SubHero page="Settings" background={settingsImage} />
      <TabsEdit />
    </Box>
  );
};
