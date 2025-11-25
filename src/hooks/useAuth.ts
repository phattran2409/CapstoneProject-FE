import { useAuthStore } from '../store/authStore';
import { authService } from '../services';

interface AuthResult {
  success: boolean;
  data?: any;
  error?: any;
}

export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await authService.login(email, password);
      login({ email: response.user.email, name: response.user.name, token: response.token });
      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const handleLogout = async (): Promise<AuthResult> => {
    try {
      await authService.logout();
      logout();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Logout locally even if API call fails
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

