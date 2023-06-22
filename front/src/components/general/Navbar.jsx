import * as React from "react";
import { useState } from "react";
import {
  Container,
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Menu,
  MenuItem,

} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import QuizIcon from "@mui/icons-material/Quiz";
import StoreIcon from "@mui/icons-material/Store";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import SignOutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Cookies from "js-cookie";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import ThemMode from "./ThemMode";
import axios from "axios";
import LanguageSwitcher from "./ChangLang";
import { useTranslation } from "react-i18next";
import profileImage from "../../assets/profile.png";
const pages = ["Home", "Stations", "About Us", "Faqs", "Login", "Register"];

function MuiAppbar() {
  const { t, } = useTranslation();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = (page) => {
    setAnchorElUser(null);
    if (page === "logOut") {
      navigate("/");
      Cookies.remove("token");
    }
    if (page === "settings") {
      navigate("/settings");
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleNavigateInMobile = (page) => {
    setOpen(false);
    if (page === "Home") {
      navigate("/");
    } else {
      navigate(`/${page}`);
    }
  };
  const handleLogOutInMobile = () => {
    navigate("/");
    Cookies.remove("token");
  };
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
        }
      );
      setUser(res.data.result);
    } catch (err) {
      console.log(err);
    }
  };
  React.useEffect(() => {
    if (Cookies.get("token")) {
      fetchUser();
    }
  },[]);

  return (
    <>
      <AppBar
        sx={{
          position: ["relative", "absolute"],
          top: "0px",
          left: "0px",
          backgroundColor: ["background.therd", "transparent"],
          borderBottom: `1px solid`,
          borderColor: "faq",
          zIndex: 12,
          px: [0, 4, 6],
        }}
      >
        <Container>
          <Toolbar disableGutters>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "80px",
                flexGrow: [1, 1, 0],
                paddingTop: 1,
              }}
            >
              <Link to="/">
                <img
                  src={logo}
                  alt="logo"
                  loading="lazy"
                  style={{
                    width: "120px",
                    height: "40px",
                    borderRadius: "50%",
                    transform: "scale(1,1.7)",
                  }}
                />
              </Link>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
              }}
            >
              {pages.map((page) => (
                <Link
                  to={page === "Home" ? "/" : page}
                  key={page}
                  style={{
                    margin: "10px",
                    color: "white",
                    display: "block",
                    fontSize: "17px",
                  
                    textDecoration: "none",
                    textTransform: "capitalize",
                  }}
                >
                  {t(page)}
                </Link>
              ))}
            </Box>
            <ThemMode />
            <Box sx={{px:[0,0,2]}}>
            <LanguageSwitcher />
            </Box>
            {
              // render user avatar if user is logged in
              Cookies.get("token") ? (
                <Box sx={{ flexGrow: 0,display:["none","none","flex"] }}>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt="Profile Picture"
                        src={user.image? user.image: profileImage}
                        sx={{ width: 45, height: 45 }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "10px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {["settings", "logOut"].map((setting) => (
                      <MenuItem
                        key={setting}
                        onClick={() => handleCloseUserMenu(setting)}
                        sx={{fontSize:"20px"}}
                      >
                        <Typography textAlign="center">{setting}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              ) : null
            }
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpen}
              color="inherit"
              sx={{ display: { md: "none" }, ml: 1 }}
            >
              <MenuIcon sx={{ fontSize: "40px" }} />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ backgroundColor: "transparent" }}
      >
        <Box
          sx={{
            backgroundColor: "background.therd",
            height: "100%",
            position: "relative",
            px:2
          }}
        >
          <CloseIcon
            sx={{
              color: "white",
              margin: "15px",
              fontSize: "40px",
              position: "absolute",
              top: "0px",
              right: "0px",
              cursor: "pointer",
            }}
            onClick={handleClose}
          />
          <List sx={{ marginTop: "45px" }}>
            {[
              { text: "Home", icon: <HomeIcon sx={{ color: "white" }} /> },
              { text: "About Us", icon: <InfoIcon sx={{ color: "white" }} /> },
              { text: "Stations", icon: <StoreIcon sx={{ color: "white" }} /> },
              { text: "Faqs", icon: <QuizIcon sx={{ color: "white" }} /> },
            ].map((Item, index) => (
              <ListItem
                key={Item.text}
                disablePadding
                onClick={() => handleNavigateInMobile(Item.text)}
              >
                <ListItemButton>
                  <ListItemIcon>{Item.icon}</ListItemIcon>
                  <ListItemText
                    primary={t(Item.text)}
                    sx={{ color: "white", textTransform: "capitalize" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {[
              {
                text: "Register",
                icon: <AppRegistrationIcon sx={{ color: "white" }} />,
              },
              { text: "Login", icon: <LoginIcon sx={{ color: "white" }} /> },
            ].map((Item, index) => (
              <ListItem
                key={Item.text}
                disablePadding
                onClick={() => handleNavigateInMobile(Item.text)}
              >
                <ListItemButton>
                  <ListItemIcon>{Item.icon}</ListItemIcon>
                  <ListItemText
                    primary={t(Item.text)}
                    sx={{ color: "white", textTransform: "capitalize" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {
              // render SignOutIcon Button if user login
              Cookies.get("token") ? (
                <ListItem disablePadding onClick={() => handleLogOutInMobile}>
                  <ListItemButton>
                    <ListItemIcon>
                      <SignOutIcon sx={{ color: "white" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("LogOut")}
                      sx={{ color: "white", textTransform: "capitalize" }}
                    />
                  </ListItemButton>
                </ListItem>
              ) : null
            }
          </List>
          {
            // render user name and image settings in mobile if user is logged in
            Cookies.get("token") ? (
              <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip
                    title="Open settings"
                    onClick={() => {
                      navigate("/settings");
                      setOpen(false);
                    }}
                  >
                    <IconButton sx={{ p: 0 }}>
                      <Avatar
                        alt="Remy Sharp"
                        src={user.image? user.image:profileImage}
                        sx={{ width: 45, height: 45 }}
                      />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ ml: "10px" }}>
                  <Typography
                    variant="body1"
                    sx={{ color: "white", fontWeight: "500px",px:2}}
                  >
                     { user.FName? user.FName :null} {user.LName? user.LName :null}
                  </Typography>
                </Box>
              </Box>
            ) : null
          }
        </Box>
      </Drawer>
    </>
  );
}
export default MuiAppbar;
