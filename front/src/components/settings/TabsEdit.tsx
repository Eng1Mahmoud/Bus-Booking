import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Chip, Container, Divider } from "@mui/material";
import { ChangeImage } from "./ChangeImage";
import { ChangePassword } from "./ChangePassword";
import { ChangeInfo } from "./ChangeInfo";
import axios from "axios";
import Cookies from "js-cookie";
import { Loading } from "../general/Loading";
import { useTranslation } from "react-i18next";
import { useEffect, useState, type ReactNode, type SyntheticEvent } from "react";
import type { UserProfile } from "@/types";
interface TabPanelProps {
  children?: ReactNode;
  value: number;
  index: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Box>{children}</Box>
        </Box>
      )}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
export default function TabsEdit() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { t } = useTranslation();
  const fetchUser = async () => {
    try {
      const res = await axios.post(
        "https://booking-bus.onrender.com/getUser/",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${Cookies.get("token")}`,
          },
        },
      );
      setUser(res.data.result);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };
  const [value, setValue] = useState(0);
  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  useEffect(() => {
    if (Cookies.get("token")) {
      fetchUser();
    }
  }, [user?.image]);
  return (
    <Container maxWidth="md">
      <Divider
        textAlign="center"
        sx={{ color: "main", py: 3, width: ["300px", "500px"], margin: "auto" }}
      >
        <Chip
          label=" Acount Settings"
          sx={{
            backgroundColor: "main",
            color: "text.main",
            fontWeight: "200",
            fontSize: "1.2rem",
          }}
        />
      </Divider>
      {loading || !user ? (
        <Loading />
      ) : (
        <>
          <ChangeImage name={`${user.FName} ${user.LName}`} oldImage={user.image} />
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label={t("Edit")} {...a11yProps(0)} />
                <Tab label={t("Edit Password")} {...a11yProps(1)} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <ChangeInfo oldInformation={user} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <ChangePassword />
            </TabPanel>
          </Box>
        </>
      )}
    </Container>
  );
}
