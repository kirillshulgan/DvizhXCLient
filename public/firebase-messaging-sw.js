// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBmNroBwpnGFlVcu0ZkJsS9fi22Y--hbb8",
  authDomain: "dvizhx-b5baf.firebaseapp.com",
  projectId: "dvizhx-b5baf",
  storageBucket: "dvizhx-b5baf.firebasestorage.app",
  messagingSenderId: "863475662536",
  appId: "1:863475662536:web:23e47bf362cfef1f0aaffd",
  measurementId: "G-B32KMZ007Q"
});

const messaging = firebase.messaging();

// Обработка фоновых сообщений
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // const notificationTitle = payload.notification.title;
  // const notificationOptions = {
  //   body: payload.notification.body,
  //   icon: '/pwa-192x192.png' // Твоя иконка
  // };

  // self.registration.showNotification(notificationTitle, notificationOptions);
});