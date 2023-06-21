import * as React from "react";
import PropTypes from "prop-types";
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
function TabPanel(props) {
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

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
export default function TabsEdit() {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState({});
  const {t} = useTranslation()
  const fetchUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:4000/getUser/",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      setUser(res.data.result);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  React.useEffect(() => {
    if(Cookies.get("token")){
      fetchUser();
    }
  },[user.image]);
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
      {loading ? (
       <Loading/>
      ) : (
        <>
          <ChangeImage
            name={`${user.FName} ${user.LName}`}
            oldImage={user.image}
          />
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
