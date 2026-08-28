import { useEffect, useState, type MouseEvent } from "react";
import { MenuItem, Box, Tooltip, IconButton, Menu } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import i18n from "@/i18n";
import { useAppSelector } from "@/store";
import { changLang, type Language } from "@/store/uiSlice";
import { useAppDispatch } from "@/store";
const LanguageSwitcher = () => {
  const dispatch = useAppDispatch();
  const curruntLang = useAppSelector((state) => state.trips.lang);
  useEffect(() => {
    i18n.changeLanguage(curruntLang);
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [curruntLang]);

  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);
  const handleChangeLang = (lang: Language) => {
    dispatch(changLang(lang));
    i18n.changeLanguage(curruntLang);
    setAnchorElUser(null);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
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
