// User types
export interface User {
  FName: string;
  LName: string;
  email: string;
  password?: string;
  image?: string;
  bookingsHistory?: Booking[];
}

export interface Booking {
  date: string;
  from: string;
  to: string;
  seatePrice: number;
  busNumber: number;
  seatNumber: number;
  serialBook: string;
}

// Trip types
export interface Seat {
  seatNumber: number;
  status: boolean;
}

export interface Bus {
  number: string;
  time: string;
  price: number;
  seats: Seat[];
  capacity: number;
}

export interface Trip {
  _id?: string;
  from: string;
  to: string;
  date: string;
  bus: Bus[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  FName: string;
  LName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  exist: boolean;
  message: string;
  token?: string;
  verification_code?: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  result?: T;
  exist?: boolean;
  verification?: boolean;
}

// Redux State types
export interface TripsState {
  trips: Trip[];
  themeDark: boolean;
  lang: string;
}

export interface RootState {
  trips: TripsState;
}
