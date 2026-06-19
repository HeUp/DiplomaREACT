import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  isOnline: navigator.onLine,
  themeMode: 'dark',
  notification: null,
  notifications: [
    { id: 1, title: 'Новая задача', message: 'Назначена задача "Монтаж перекрытий"', time: '5 мин назад', unread: true },
    { id: 2, title: 'Изменение статуса', message: 'Задача "Устройство фундамента" завершена', time: '1 час назад', unread: true },
    { id: 3, title: 'Запрос материалов', message: 'Поступила новая заявка на бетон', time: '3 часа назад', unread: false },
  ],

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })),
  setOnline: (isOnline) => set({ isOnline }),

  showNotification: (message, severity = 'info') =>
    set({ notification: { message, severity, open: true } }),
  hideNotification: () => set({ notification: null }),

  markNotifRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, unread: false } : n),
  })),
  addNotif: (notif) => set((s) => ({
    notifications: [{ id: Date.now(), ...notif, unread: true }, ...s.notifications],
  })),
}));

export default useUIStore;
