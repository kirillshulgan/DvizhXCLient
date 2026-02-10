import { type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { BoardPage } from './features/kanban/BoardPage';
import { EventListPage } from './features/events/EventListPage';

// В реальном проекте это должно быть в константах
const ACCESS_TOKEN_KEY = 'accessToken'; 

// Защищенный маршрут
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    // Простая проверка наличия токена. 
    // В будущем здесь стоит добавить проверку срока действия (JWT exp)
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    // Если токена нет, редиректим на логин
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Публичные маршруты */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Защищенные маршруты */}
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute>
                            <EventListPage />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/board/:id" 
                    element={
                        <PrivateRoute>
                            <BoardPage />
                        </PrivateRoute>
                    } 
                />

                {/* Catch-all route (404) -> редирект на главную */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
