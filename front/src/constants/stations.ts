export interface StationOption {
  name: string;
  /** City headings group the stations under them and cannot be selected. */
  isCity: boolean;
}

/**
 * Departure and destination options for the search form.
 *
 * Lifted out of MuiForm, where the list was inline and duplicated for the two
 * selects. Names are translation keys, resolved through i18next at render time.
 */
export const STATIONS: StationOption[] = [
  { name: "Hurghada", isCity: true },
  { name: "El Nasr Street", isCity: false },
  { name: "Watanya-HRG", isCity: false },
  { name: "Al Ahyaa", isCity: false },
  { name: "Giza/Cairo", isCity: true },
  { name: "6 October - El Hussary", isCity: false },
  { name: "Ramsis", isCity: false },
  { name: "Alexandria", isCity: true },
  { name: "Sidi Gaber", isCity: false },
  { name: "Moharam Bek", isCity: false },
  { name: "Dahab", isCity: true },
  { name: "Dahab", isCity: false },
  { name: "Sohag", isCity: true },
  { name: "Dar ElTeb", isCity: false },
  { name: "El Ray", isCity: false },
  { name: "Sharm El Sheikh", isCity: true },
  { name: "Watanya-SSH", isCity: false },
  { name: "El Ruwaysat", isCity: false },
  { name: "Luxor", isCity: true },
  { name: "Railway station", isCity: false },
  { name: "Armant", isCity: false },
  { name: "Qena", isCity: true },
  { name: "Qift", isCity: false },
  { name: "Qena ", isCity: false },
  { name: "Asyout", isCity: true },
  { name: "Elmoalmien", isCity: false },
  { name: "ELHILALEY", isCity: false },
];
