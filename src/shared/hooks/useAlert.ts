import { useState, useCallback } from 'react';
import { AlertType } from '../components/Alert';

interface AlertOptions {
  type: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const useAlert = () => {
  const [visible, setVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertOptions(options);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    // Clear options after animation completes
    setTimeout(() => {
      setAlertOptions(null);
    }, 300);
  }, []);

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText?: string,
      cancelText?: string
    ) => {
      showAlert({
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          onConfirm();
          hideAlert();
        },
        onCancel: () => {
          onCancel?.();
          hideAlert();
        },
      });
    },
    [showAlert, hideAlert]
  );

  const showDanger = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText?: string,
      cancelText?: string
    ) => {
      showAlert({
        type: 'danger',
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          onConfirm();
          hideAlert();
        },
        onCancel: () => {
          onCancel?.();
          hideAlert();
        },
      });
    },
    [showAlert, hideAlert]
  );

  const showInfo = useCallback(
    (
      title: string,
      message?: string,
      onConfirm?: () => void,
      autoClose: boolean = true,
      autoCloseDelay: number = 3000
    ) => {
      showAlert({
        type: 'info',
        title,
        message,
        onConfirm,
        onClose: hideAlert,
        autoClose,
        autoCloseDelay,
      });
    },
    [showAlert, hideAlert]
  );

  const showSuccess = useCallback(
    (
      title: string,
      message?: string,
      onConfirm?: () => void,
      autoClose: boolean = true,
      autoCloseDelay: number = 3000
    ) => {
      showAlert({
        type: 'success',
        title,
        message,
        onConfirm,
        onClose: hideAlert,
        autoClose,
        autoCloseDelay,
      });
    },
    [showAlert, hideAlert]
  );

  return {
    visible,
    alertOptions,
    showAlert,
    hideAlert,
    showConfirm,
    showDanger,
    showInfo,
    showSuccess,
  };
};

