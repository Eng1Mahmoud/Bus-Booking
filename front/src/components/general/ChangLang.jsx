import React, { useEffect } from "react";
import { MenuItem, Box, Tooltip, IconButton, Menu } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import i18n from '../../i18n';
import { useSelector } from "react-redux";
import { changLang } from "../../redux/slices/TripsSlice";
import { useDispatch } from "react-redux";
const LanguageSwitcher = () => {
  const dispatch = useDispatch();
  const curruntLang = useSelector((state) => state.trips.lang);
  console.log(curruntLang)
  useEffect(() => {
    i18n.changeLanguage(curruntLang);
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [curruntLang]);

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const handleChangeLang = (lang) => {
    dispatch(changLang(lang));
    i18n.changeLanguage(curruntLang);
    setAnchorElUser(null);
  };
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Languages">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <LanguageIcon sx={{ color: "white", fontSize: "40px" }} />
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
        onClose={handleChangeLang}
      >
        <MenuItem onClick={() => handleChangeLang("ar")}>Arabic</MenuItem>
        <MenuItem onClick={() => handleChangeLang("en")}>English</MenuItem>
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher;
