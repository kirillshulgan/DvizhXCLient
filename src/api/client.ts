import axios from 'axios';

// Создаем инстанс. BaseURL '/api' будет работать через прокси, который мы настроили в vite.config.ts
const apiClient = axios.create({
    baseURL: 'https://api.shulgan-lab.ru/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: перед отправкой каждого запроса
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor: если пришел ответ 401 (Unauthorized)
apiClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Токен протух или неверен — выкидываем на логин
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default apiClient;