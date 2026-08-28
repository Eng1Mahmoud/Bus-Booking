import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import uiReducer from "./uiSlice";

/**
 * `redux-persist` is gone. It existed to keep the trips array across reloads,
 * which meant showing stale seat availability; preferences are now written
 * straight to localStorage by the slice.
 */
export const store = configureStore({
  reducer: {
    // Kept as `trips` so existing `useSelector((s) => s.trips.…)` calls still
    // resolve. Phase 5 renames it to `ui` as those call sites are rewritten.
    trips: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Typed hooks, so a selector knows the shape of the state it reads. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
