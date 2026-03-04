import apiClient from './client';
import type { AuthResponse, LoginRequest, RegisterRequest, TelegramAuthRequest } from '../types'; 

export const authService = {
    login: async (payload: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', payload);
        console.log(response);
        return response.data;
    },

    register: async (payload: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', payload);
        return response.data;
    },

    telegramLogin: async (payload: TelegramAuthRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/telegram', payload);
        return response.data;
    }
};
