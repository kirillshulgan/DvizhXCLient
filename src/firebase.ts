import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";
import { notificationService } from './api/notificationService';

const firebaseConfig = {
  apiKey: "AIzaSyBmNroBwpnGFlVcu0ZkJsS9fi22Y--hbb8",
  authDomain: "dvizhx-b5baf.firebaseapp.com",
  projectId: "dvizhx-b5baf",
  storageBucket: "dvizhx-b5baf.firebasestorage.app",
  messagingSenderId: "863475662536",
  appId: "1:863475662536:web:23e47bf362cfef1f0aaffd",
  measurementId: "G-B32KMZ007Q"
};

const app = initializeApp(firebaseConfig);

// 1. Делаем инициализацию messaging безопасной
let messaging: Messaging | null = null;

try {
    // Проверяем, есть ли window (для SSR) и getMessaging
    if (typeof window !== 'undefined') {
        messaging = getMessaging(app);
    }
} catch (error) {
    console.warn("Firebase Messaging failed to initialize (this is normal in non-https or private mode):", error);
    // Не выбрасываем ошибку дальше, просто оставляем messaging = null
}

export const requestForToken = async () => {
  // Если messaging не инициализировался — выходим
  if (!messaging) {
      console.log("Messaging not supported");
      return null;
  }

  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: "BP7KGjkRnslXagcw02L6Vcr9l6NBpGZT1QNlmM8-XsXkJBTQFWXHSjLiN6WwvFg7Up-NhU2eR6WmFw2kkBH3ZbQ" 
    });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      
      // 2. ВАЖНО: Оборачиваем API вызов, чтобы ошибка сети не крашила всё
      try {
          await notificationService.subscribe(currentToken);
      } catch (apiError) {
          console.error("Failed to send token to backend (ignoring to prevent loop):", apiError);
          // Не делаем throw, чтобы не триггерить глобальные перехватчики ошибок
      }

      return currentToken;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return;
  
  // Подписываемся на поток сообщений
  return onMessage(messaging, (payload) => {
    console.log("[firebase.ts] Message received:", payload);
    callback(payload);
  });
};
