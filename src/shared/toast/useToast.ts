/**
 * Toast Hook
 * Hook để sử dụng Toast message một cách dễ dàng
 */

import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { ToastOptions, ToastType } from './types';

/**
 * Hook để hiển thị Toast messages
 * 
 * @example
 * const toast = useToast();
 * toast.success('Đăng nhập thành công!');
 * toast.error('Có lỗi xảy ra', 'Vui lòng thử lại');
 * toast.info('Thông tin', 'Đây là thông báo');
 * toast.warning('Cảnh báo', 'Hãy cẩn thận');
 */
export const useToast = () => {
  /**
   * Hiển thị toast với options tùy chỉnh
   */
  const show = useCallback((options: ToastOptions) => {
    Toast.show({
      type: options.type,
      text1: options.text1,
      text2: options.text2,
      visibilityTime: options.visibilityTime ?? 3000,
      position: options.position ?? 'top',
      onShow: options.onShow,
      onHide: options.onHide,
      onPress: options.onPress,
      autoHide: options.autoHide ?? true,
    });
  }, []);

  /**
   * Hiển thị success toast
   */
  const success = useCallback(
    (text1: string, text2?: string) => {
      show({ type: 'success', text1, text2 });
    },
    [show]
  );

  /**
   * Hiển thị error toast
   */
  const error = useCallback(
    (text1: string, text2?: string) => {
      show({ type: 'error', text1, text2 });
    },
    [show]
  );

  /**
   * Hiển thị info toast
   */
  const info = useCallback(
    (text1: string, text2?: string) => {
      show({ type: 'info', text1, text2 });
    },
    [show]
  );

  /**
   * Hiển thị warning toast
   */
  const warning = useCallback(
    (text1: string, text2?: string) => {
      show({ type: 'warning', text1, text2 });
    },
    [show]
  );

  /**
   * Ẩn toast hiện tại
   */
  const hide = useCallback(() => {
    Toast.hide();
  }, []);

  return {
    show,
    success,
    error,
    info,
    warning,
    hide,
  };
};

