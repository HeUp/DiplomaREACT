import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  isOnline: navigator.onLine,
  themeMode: 'dark',
  notification: null,
  notifications: [],

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
