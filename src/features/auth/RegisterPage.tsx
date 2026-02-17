import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
    Container, Paper, TextField, Button, Typography, Box, Alert, Link 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AxiosError } from 'axios';

// Импортируем наш сервис и типы
import { authService } from '../../api/authService';
import type { RegisterRequest } from '../../types'; 

// Интерфейс для локального стейта формы (включает поля, которых нет в API, например confirmPassword)
interface RegisterFormState extends RegisterRequest {
    confirmPassword: string;
}

export const RegisterPage = () => {
    
    // Начальное состояние с типизацией
    const [formData, setFormData] = useState<RegisterFormState>({
        email: '',
        password: '',
        confirmPassword: '',
        // Обрати внимание: в прошлом коде было userName, но в authService.ts мы определили firstName/lastName. 
        // Если на бэке userName, поправь DTO в authService.ts. Я предполагаю firstName для примера.
        userName: '' 
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setIsLoading(true);

        try {
            // Вызываем типизированный сервис
            // TypeScript автоматически проверит соответствие полей, кроме confirmPassword
            const { confirmPassword, ...requestPayload } = formData;
            
            const response = await authService.register(requestPayload);

            // Логика авто-входа после регистрации
            if (response && response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                navigate('/'); 
            } else {
                // Если API требует подтверждения почты и не дает токен сразу
                alert('Регистрация успешна! Теперь войдите.');
                navigate('/login');
            }

        } catch (err) {
            console.error('Registration failed', err);
            
            if (err instanceof AxiosError && err.response?.data) {
                const data = err.response.data;
                // Пытаемся вытащить понятное сообщение
                setError(data.title || data.detail || 'Не удалось зарегистрироваться. Попробуйте другой email.');
            } else {
                setError('Произошла неизвестная ошибка.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    
                    <Box sx={{ m: 1, bgcolor: 'primary.main', p: 1, borderRadius: '50%', display: 'flex' }}>
                         <PersonAddIcon sx={{ color: 'white' }} />
                    </Box>
                    
                    <Typography component="h1" variant="h5">
                        Регистрация
                    </Typography>

                    <Box component="form" onSubmit={handleRegister} sx={{ mt: 3, width: '100%' }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Имя"
                            name="userName" // Исправил на firstName согласно DTO, если нужно userName - верни
                            value={formData.userName}
                            onChange={handleChange}
                            autoFocus
                            disabled={isLoading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Email адрес"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Пароль"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Подтвердите пароль"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{ mt: 3, mb: 2, height: 45 }}
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                Уже есть аккаунт? Войти
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};
