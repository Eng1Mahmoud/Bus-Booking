import { Box } from "@mui/material";
import React from "react";
import { SubHero } from "../components/general/SubHero";
import TabsEdit from "../components/settings/TabsEdit";
import settingsImage from "../assets/settings.jpg";
const SettingsPage = () => {
  return (
    <Box>
      <SubHero page="Settings" background={settingsImage} />
      <TabsEdit />
    </Box>
  );
};

export default SettingsPage;