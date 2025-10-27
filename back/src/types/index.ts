export interface IUser {
  FName: string;
  LName: string;
  email: string;
  password: string;
  image?: string;
  bookingsHistory?: IBooking[];
}

export interface IBooking {
  date: string;
  from: string;
  to: string;
  seatePrice: number;
  busNumber: number;
  seatNumber: number;
  serialBook: string;
}

export interface ITrip {
  _id?: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  busNumber: number;
  availableSeats: number[];
}

export interface IAdmin {
  _id?: string;
  email: string;
  password: string;
}

export interface AuthPayload {
  email: string;
}

export interface LoginResponse {
  exist: boolean;
  message: string;
  token?: string;
}

export interface SignUpResponse {
  exist: boolean;
  message: string;
  verification_code?: string;
  user?: any;
}
