import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { authService } from '../../api/authService';

export const AuthCallbackPage = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isLoading) return;

        // Ошибка проверяется ПЕРВОЙ, до проверки auth.user
        if (auth.error) {
            console.error('OIDC error:', auth.error);
            navigate('/login');
            return;
        }

        if (!auth.user?.id_token) {
            navigate('/login');
            return;
        }

        authService.telegramLogin({ id_token: auth.user.id_token })
            .then(response => {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                navigate('/');
            })
            .catch((err) => {
                console.error('Backend telegram login failed:', err);
                navigate('/login');
            });

    }, [auth.isLoading, auth.user, auth.error]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
                Выполняется вход через Telegram...
            </Typography>
        </Box>
    );
};
