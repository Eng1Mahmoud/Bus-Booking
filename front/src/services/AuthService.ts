import { apiClient } from './ApiClient';
import { LoginCredentials, SignUpData, AuthResponse, ApiResponse, User } from '../types';

export class AuthService {
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/SignUp', data);
    return response.data;
  }

  async verification(
    verification_code: string,
    user: SignUpData,
    verificationCode: string
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/verification', {
      verification_code,
      user,
      verificationCode,
    });
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/login', credentials);
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data;
  }

  async sendCodeVerification(email: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/sendCodeVerification', { email });
    return response.data;
  }

  async newPassword(
    email: string,
    password: string,
    verificationCode: string,
    verification_code: string
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/newPassword', {
      email,
      password,
      verificationCode,
      verification_code,
    });
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/signin';
  }
}

export class UserService {
  async getUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/getUser');
    return response.data;
  }

  async uploadImage(image: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/uploadImage', { image });
    return response.data;
  }

  async updateInfo(FName: string, LName: string, email: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/updateInfo', {
      FName,
      LName,
      email,
    });
    return response.data;
  }

  async changePassword(password: string, newPassword: string): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/changePassword', {
      password,
      newPassword,
    });
    return response.data;
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>('/getAllUsers');
    return response.data;
  }

  async deleteUser(email: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/deleteUser/${email}`);
    return response.data;
  }
}

export const authService = new AuthService();
export const userService = new UserService();
