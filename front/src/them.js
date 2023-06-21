import { createTheme } from "@mui/material/styles";
export const theme = createTheme({
  palette: {
    primary: {
      main: "#2c387e",
    },
    secondary: {
      main: "#388e3c",
    },
    error: {
      main: "#f44336",
    },
    text: {
      main: "#2c387e",
      secondary: "#000",
      therd: "#fff",
    },
    background: {
      main: "#fff",
      therd: "#2c387e",
    },
  },
});

const themeDark = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#fff",
    },
    secondary: {
      main: "#388e3c",
    },
    error: {
      main: "#f44336",
    },
    text: { main: "#fff", secondary: "#eeeeee", therd: "#fff" },

    background: {
      main: "#16181d",
      secondary: "rgba(255, 255, 255, 0.16)",
      therd: "rgba(255, 255, 255, 0.16)",
    },
  },
});
export default themeDark;
