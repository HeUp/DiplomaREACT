import { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../../state/authStore';
import { authApi } from '../../data-access/api/authApi';
import { dbApi, initDB } from '../../data-access/db/sqliteDb';

const DEMO_USERS = [
  { id: 1, full_name: 'Администратор', email: 'Sxnctified@gmail.com', password: 'Sxnctified', role: 'admin', profile_picture: '' },
  { id: 2, full_name: 'Руководитель проекта', email: 'manager@test.ru', password: '123456', role: 'manager', profile_picture: '' },
  { id: 3, full_name: 'Прораб Иванов', email: 'foreman@test.ru', password: '123456', role: 'foreman', profile_picture: '' },
  { id: 4, full_name: 'Снабженец Петров', email: 'supplier@test.ru', password: '123456', role: 'supplier', profile_picture: '' },
];

const PROFILE_KEY = 'stroikontrol_profile';

const AuthContext = createContext(null);

const findSQLiteUser = async (email, password) => {
  try {
    await initDB();
    const all = await dbApi.users.getAll();
    return all.find(u => u.email.toLowerCase() === email && u.password_hash === password) || null;
  } catch { return null; }
};

export const AuthProvider = ({ children }) => {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    const email = (localStorage.getItem('demoEmail') || '').toLowerCase();
    const demo = DEMO_USERS.find(u => u.email.toLowerCase() === email);
    if (demo) {
      const { password, ...safe } = demo;
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        try {
          const overrides = JSON.parse(saved);
          if (overrides.email.toLowerCase() === email) {
            Object.assign(safe, overrides);
          }
        } catch {}
      }
      setUser(safe);
    } else {
      authApi.me().then(setUser).catch(() => {
        localStorage.removeItem('accessToken');
        setLoading(false);
      });
    }
  }, [setUser, setLoading]);

  const login = async ({ email, password }) => {
    email = email.toLowerCase();
    const demo = DEMO_USERS.find(u => u.email.toLowerCase() === email && u.password === password);
    if (demo) {
      const { password: _, ...safe } = demo;
      localStorage.setItem('accessToken', 'demo-token-' + demo.id);
      localStorage.setItem('demoEmail', demo.email);
      setUser(safe);
      return safe;
    }

    const sqliteUser = await findSQLiteUser(email, password);
    if (sqliteUser) {
      const { password_hash, ...safe } = sqliteUser;
      localStorage.setItem('accessToken', 'sqlite-token-' + sqliteUser.id);
      localStorage.setItem('demoEmail', sqliteUser.email);
      setUser(safe);
      return safe;
    }

    const data = await authApi.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('demoEmail');
    setUser(null);
  };

  const uploadProfilePhoto = async (file) => {
    const store = useAuthStore.getState();
    const demoEmail = (localStorage.getItem('demoEmail') || '').toLowerCase();
    const isHardcodedDemo = DEMO_USERS.some(u => u.email.toLowerCase() === demoEmail);

    if (isHardcodedDemo) {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      store.updateUser({ profile_picture: dataUrl });
      const saved = localStorage.getItem(PROFILE_KEY);
      const existing = saved ? JSON.parse(saved) : {};
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...existing, profile_picture: dataUrl }));
      return dataUrl;
    }

    const formData = new FormData();
    formData.append('photo', file);
    const { profile_picture } = await authApi.uploadProfilePhoto(formData);
    store.updateUser({ profile_picture });
    return profile_picture;
  };

  const updateProfile = async ({ full_name, email, currentPassword, newPassword }) => {
    const store = useAuthStore.getState();
    const demoEmail = (localStorage.getItem('demoEmail') || '').toLowerCase();
    const isHardcodedDemo = DEMO_USERS.some(u => u.email.toLowerCase() === demoEmail);

    if (isHardcodedDemo) {
      if (newPassword && currentPassword) {
        const demo = DEMO_USERS.find(u => u.email.toLowerCase() === demoEmail);
        if (demo && demo.password !== currentPassword) {
          throw new Error('Неверный текущий пароль');
        }
      }
      const updates = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (email !== undefined) updates.email = email.toLowerCase();
      store.updateUser(updates);
      const saved = localStorage.getItem(PROFILE_KEY);
      const existing = saved ? JSON.parse(saved) : {};
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...existing, ...updates, email: email || existing.email }));
      return { ...store.user, ...updates };
    }

    const data = await authApi.updateProfile({ full_name, email, currentPassword, newPassword });
    store.updateUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user: useAuthStore(s => s.user),
      isAuthenticated: useAuthStore(s => s.isAuthenticated),
      isLoading: useAuthStore(s => s.isLoading),
      login, logout, updateProfile, uploadProfilePhoto,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
