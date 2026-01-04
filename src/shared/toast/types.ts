

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {

  type: ToastType;
  /** Nội dung message */
  text1?: string;
  /** Nội dung phụ (optional) */
  text2?: string;
  /** Thời gian hiển thị (ms), mặc định 3000 */
  visibilityTime?: number;
  /** Vị trí hiển thị */
  position?: 'top' | 'bottom';
  /** Callback khi toast được hiển thị */
  onShow?: () => void;
  /** Callback khi toast bị ẩn */
  onHide?: () => void;
  /** Callback khi user press vào toast */
  onPress?: () => void;
  /** Auto hide hay không */
  autoHide?: boolean;
}

export interface ToastService {
  show: (options: ToastOptions) => void;
  success: (text1: string, text2?: string) => void;
  error: (text1: string, text2?: string) => void;
  info: (text1: string, text2?: string) => void;
  warning: (text1: string, text2?: string) => void;
  hide: () => void;
}

