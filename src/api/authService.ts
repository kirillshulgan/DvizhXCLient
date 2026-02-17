import apiClient from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'; 

export const authService = {
    login: async (payload: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', payload);
        return response.data;
    },

    register: async (payload: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', payload);
        return response.data;
    },

    telegramLogin: async (telegramData: any) => {
        // telegramData — это объект, который пришел от виджета (id, hash, auth_date...)
        // Оборачиваем его в структуру { data: ... }, как ожидает твой Command на бэкенде
        const payload = { data: telegramData };
        
        const response = await apiClient.post('/auth/TelegramAuth', payload);
        return response.data;
    }
};
