import apiClient from './client';

const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) {
        return "Android";
    }
    if (/iPad|iPhone|iPod/i.test(ua)) {
        return "iOS";
    }
    return "Web";
};

export const notificationService = {
    subscribe: async (token: string) => {
        const payload = {
            token,
            deviceType: getDeviceType()
        };

        console.log(payload);
        const response = await apiClient.post('/notifications/subscribe', payload );
        console.log(response);
        return response.data;
    }
};