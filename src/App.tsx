import { type JSX, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { BoardPage } from './features/kanban/BoardPage';
import { EventListPage } from './features/events/EventListPage';
import { Toaster, toast } from 'react-hot-toast';
import { requestForToken, onMessageListener } from './firebase'; 

const ACCESS_TOKEN_KEY = 'accessToken';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    // Используем ref, чтобы хранить состояние инициализации
    const isNotificationInitialized = useRef(false);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);

        // 1. Если токена нет (мы вышли), сбрасываем флаг, чтобы при следующем входе инициализация сработала снова
        if (!token) {
            isNotificationInitialized.current = false;
            return;
        }

        // 2. Если уже инициализировали в этой сессии — не повторяем
        if (isNotificationInitialized.current) return;

        // 3. Начинаем инициализацию
        const initNotifications = async () => {
            isNotificationInitialized.current = true;
            
            try {
                console.log("Initializing Notifications...");
                await requestForToken();

                // Слушаем сообщения
                // onMessageListener возвращает Promise, который резолвится при ПЕРВОМ сообщении.
                // Чтобы слушать ПОСТОЯННО, нужно переделать onMessageListener в firebase.ts 
                // или использовать этот код, если твоя реализация поддерживает подписку.
                // НО! Стандартный onMessage из firebase/messaging работает как стрим событий.
                
                // 🔥 ВАЖНО: вызываем слушатель. 
                // Если твоя onMessageListener в firebase.ts возвращает Promise, она сработает 1 раз.
                // Лучше сделать так (см. ниже про firebase.ts), но пока оставим как есть:
                
                onMessageListener((payload: any) => {
                    console.log('Push received in FOREGROUND:', payload);
                    const { title, body } = payload.notification || {};

                    // Просто показываем тост. Без лишних if.
                    // Если этот код сработал, значит юзер точно на сайте.
                    toast.custom((t) => (
                        <div
                            style={{
                                // --- БАЗОВЫЕ СТИЛИ (Твои текущие) ---
                                display: 'flex',
                                alignItems: 'flex-start',
                                width: '100%',
                                maxWidth: '380px',
                                backgroundColor: 'rgba(33, 33, 33, 0.95)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
                                padding: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                pointerEvents: 'auto',
                                position: 'relative',
                                overflow: 'hidden',

                                // --- 🔥 АНИМАЦИЯ (Вместо CSS классов) 🔥 ---
                                // 1. Плавность изменений
                                transition: 'all 0.3s ease-in-out',
                                
                                // 2. Если t.visible == true -> показываем (100%), иначе -> скрываем (0%)
                                opacity: t.visible ? 1 : 0,
                                
                                // 3. Эффект масштаба (появление) или сдвига
                                // При появлении: масштаб 1. При исчезновении: чуть уменьшаем (0.9)
                                transform: t.visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-20px)',
                            }}
                        >
                            {/* Акцентная полоска */}
                            <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: '#6366f1'
                            }} />

                            {/* Иконка */}
                            <div style={{ marginRight: '16px', flexShrink: 0, paddingTop: '4px' }}>
                                <div style={{ fontSize: '24px' }}>🔔</div>
                            </div>

                            {/* Текст */}
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', lineHeight: '1.4', color: '#fff' }}>
                                    {title}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#ccc', lineHeight: '1.4' }}>
                                    {body}
                                </p>
                            </div>

                            {/* Кнопка закрытия */}
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#999',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    marginLeft: '12px',
                                    marginTop: '-4px',
                                    transition: 'color 0.2s' // Плавная смена цвета при наведении
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ), { duration: 5000 });
                });

            } catch (err) {
                console.error("Error init notifications", err);
            }
        };

        initNotifications();

    }, [location.pathname]); // Перепроверяем при смене URL (чтобы поймать момент входа)

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={12} // Отступ между несколькими уведомлениями
                containerStyle={{
                    top: 24,
                    right: 24,
                }}
                toastOptions={{
                    // Сбрасываем дефолтные стили, чтобы управлять ими вручную в toast.custom
                    style: {
                        background: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                    },
                }}
            />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<PrivateRoute><EventListPage /></PrivateRoute>} />
                <Route path="/board/:id" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
