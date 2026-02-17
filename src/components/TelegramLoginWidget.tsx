import { useEffect, useRef } from 'react';

interface TelegramLoginWidgetProps {
    botName: string;
    onAuth: (user: any) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: 'write'; // Telegram разрешает только 'write' или отсутствие атрибута
    usePic?: boolean;
}

export const TelegramLoginWidget = ({ 
    botName, 
    onAuth, 
    buttonSize = 'large', 
    cornerRadius = 10, 
    requestAccess = 'write', 
    usePic = true 
}: TelegramLoginWidgetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Создаем глобальную функцию, которую вызовет Telegram после входа
        // Мы привязываем её к window, так как скрипт виджета ищет её именно там
        (window as any).onTelegramAuth = (user: any) => {
            onAuth(user);
        };

        // 2. Создаем тег <script>
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', buttonSize);
        if (cornerRadius !== undefined) {
            script.setAttribute('data-radius', cornerRadius.toString());
        }
        if (requestAccess) {
            script.setAttribute('data-request-access', requestAccess);
        }
        script.setAttribute('data-userpic', usePic.toString());
        
        // Указываем имя функции, которую нужно вызвать
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        
        script.async = true;

        // 3. Вставляем скрипт в наш div
        if (containerRef.current) {
            containerRef.current.innerHTML = ''; // Очищаем, чтобы не дублировалось при ре-рендере
            containerRef.current.appendChild(script);
        }

        // Очистка при размонтировании компонента (не обязательно, но полезно)
        return () => {
            // delete (window as any).onTelegramAuth; // Можно удалить, если не планируется повторный вход
        };
    }, [botName, buttonSize, cornerRadius, requestAccess, usePic, onAuth]);

    return <div ref={containerRef} />;
};
