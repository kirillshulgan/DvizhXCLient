import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
    Container, Paper, TextField, Button, Typography, Box, Alert, Link 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AxiosError } from 'axios';

import { authService } from '../../api/authService';
import type { LoginRequest } from '../../types'; 

export const LoginPage = () => {
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: ''
    });
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await authService.login(formData);
            localStorage.setItem('accessToken', response.accessToken);
            
            navigate('/');
        } catch (err) {
            console.error('Login failed', err);
            
            if (err instanceof AxiosError && err.response?.data) {
                const data = err.response.data;
                setError(data.title || data.message || 'Ошибка входа. Проверьте данные.');
            } else {
                setError('Произошла неизвестная ошибка.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ m: 1, bgcolor: 'secondary.main', p: 1, borderRadius: '50%', display: 'flex' }}>
                         <LockOutlinedIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography component="h1" variant="h5">
                        Вход в DvizhX
                    </Typography>

                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email адрес"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Пароль"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2, height: 50 }}
                        >
                            {isLoading ? 'Вход...' : 'Войти'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/register" variant="body2">
                                Нет аккаунта? Зарегистрироваться
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};
