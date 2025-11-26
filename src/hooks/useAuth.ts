import { useAuthStore } from '../store/authStore';
import { authService } from '../services';
import log from '../utils/logger';

interface AuthResult {
  success: boolean;
  data?: any;
  error?: any;
}

export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string): Promise<AuthResult> => {
    try {
      log.debug('useAuth.handleLogin.start', { email });
      const response = await authService.login(email, password);
      login({ email: response.user.email, name: response.user.name, token: response.token });
      log.info('useAuth.handleLogin.success', { email: response.user.email });
      return { success: true, data: response };
    } catch (error) {
      log.error('useAuth.handleLogin.error', { email, error });
      return { success: false, error };
    }
  };

  const handleLogout = async (): Promise<AuthResult> => {
    try {
      log.debug('useAuth.handleLogout.start');
      await authService.logout();
      logout();
      log.info('useAuth.handleLogout.success');
      return { success: true };
    } catch (error) {
      log.warn('useAuth.handleLogout.error', error);
      logout();
      return { success: false, error };
    }
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
  };
};

