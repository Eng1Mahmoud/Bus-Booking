import { api } from "@/api/client";
import type { ChangePasswordResponse, ProfileResponse } from "@/types/apiResponses";
import type { UserProfile } from "@/types";

export const userService = {
  async me(): Promise<UserProfile> {
    const { data } = await api.get<ProfileResponse>("/api/users/me");
    return data.result;
  },

  async updateProfile(input: {
    FName: string;
    LName: string;
    email: string;
  }): Promise<UserProfile> {
    const { data } = await api.patch<ProfileResponse>("/api/users/me", input);
    return data.result;
  },

  async changePassword(input: {
    password: string;
    newPassword: string;
  }): Promise<ChangePasswordResponse["result"]> {
    const { data } = await api.patch<ChangePasswordResponse>(
      "/api/users/me/password",
      input,
    );
    return data.result;
  },

  async updateAvatar(image: string): Promise<UserProfile> {
    const { data } = await api.put<ProfileResponse>("/api/users/me/avatar", { image });
    return data.result;
  },
};
