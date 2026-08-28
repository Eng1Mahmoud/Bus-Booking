import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Trip } from "@/types";

export type Language = "en" | "ar";

interface UiState {
  /**
   * Search results.
   *
   * Server data living in Redux is a stopgap: Phase 5 moves it to TanStack
   * Query, where it can refetch and expire. It is deliberately NOT persisted —
   * `redux-persist` used to write it to localStorage, so a returning visitor
   * saw seat availability captured days earlier.
   */
  trips: Trip[];
  themeDark: boolean;
  lang: Language;
}

const STORAGE_KEY = "tazkarty.preferences";

/**
 * Only the two preferences are persisted, and through plain localStorage
 * rather than redux-persist — one dependency and one rehydration step fewer,
 * for two booleans.
 */
interface StoredPreferences {
  themeDark: boolean;
  lang: Language;
}

const loadPreferences = (): StoredPreferences => {
  const fallback: StoredPreferences = { themeDark: true, lang: "en" };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      themeDark:
        typeof parsed.themeDark === "boolean" ? parsed.themeDark : fallback.themeDark,
      lang: parsed.lang === "ar" ? "ar" : "en",
    };
  } catch {
    // Private browsing, disabled storage, or corrupt JSON — none of which
    // should stop the app rendering.
    return fallback;
  }
};

const savePreferences = (state: UiState): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ themeDark: state.themeDark, lang: state.lang }),
    );
  } catch {
    // Storage being unavailable is not worth failing a click over.
  }
};

const initialState: UiState = { trips: [], ...loadPreferences() };

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    activeTrips: (state, { payload }: PayloadAction<Trip[]>) => {
      state.trips = payload;
    },
    activeThemeDark: (state, { payload }: PayloadAction<boolean>) => {
      state.themeDark = payload;
      savePreferences(state);
    },
    changLang: (state, { payload }: PayloadAction<Language>) => {
      state.lang = payload;
      savePreferences(state);
    },
  },
});

export const { activeTrips, activeThemeDark, changLang } = uiSlice.actions;

export default uiSlice.reducer;
