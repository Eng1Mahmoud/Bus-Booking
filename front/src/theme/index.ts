import { createTheme, type Theme } from "@mui/material/styles";

/**
 * The palette carries keys MUI does not ship: `text.main`, `text.therd`,
 * `background.main`, and so on. They are referenced from `sx` props across
 * roughly thirty components, so they are declared to TypeScript here rather
 * than renamed.
 *
 * `therd` is a misspelling of "third" that predates this refactor. Renaming it
 * touches every one of those call sites for no behavioural gain, so it is left
 * alone deliberately — not overlooked.
 */
declare module "@mui/material/styles" {
  interface TypeText {
    main: string;
    therd: string;
  }
  interface TypeBackground {
    main: string;
    secondary: string;
    therd: string;
  }
}

const shared = {
  secondary: { main: "#388e3c" },
  error: { main: "#f44336" },
} as const;

export const themeLight: Theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2c387e" },
    ...shared,
    text: {
      main: "#2c387e",
      secondary: "#000",
      therd: "#fff",
    },
    background: {
      main: "#fff",
      secondary: "#f5f5f5",
      therd: "#2c387e",
    },
  },
});

export const themeDark: Theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#fff" },
    ...shared,
    text: {
      main: "#fff",
      secondary: "#eeeeee",
      therd: "#fff",
    },
    background: {
      main: "#16181d",
      secondary: "rgba(255, 255, 255, 0.16)",
      therd: "rgba(255, 255, 255, 0.16)",
    },
  },
});

/** Kept as named exports too; `theme` was the light one's original name. */
export const theme = themeLight;

export default themeDark;
