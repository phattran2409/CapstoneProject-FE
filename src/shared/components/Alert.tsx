import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { ThemedIcon } from './themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from './Button';

export type AlertType = 'confirm' | 'danger' | 'info' | 'success';

export interface AlertProps {
  visible: boolean;
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

const Alert: React.FC<AlertProps> = ({
  visible,
  type,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  showCloseButton = false,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const { theme } = useTheme();

  React.useEffect(() => {
    if (visible && autoClose && (type === 'info' || type === 'success')) {
      const timer = setTimeout(() => {
        onClose?.();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, autoCloseDelay, type, onClose]);

  const getIconConfig = () => {
    switch (type) {
      case 'confirm':
        return { name: 'help-circle' as const, color: theme.colors.info };
      case 'danger':
        return { name: 'warning' as const, color: theme.colors.error };
      case 'info':
        return { name: 'information-circle' as const, color: theme.colors.info };
      case 'success':
        return { name: 'checkmark-circle' as const, color: theme.colors.success };
      default:
        return { name: 'information-circle' as const, color: theme.colors.info };
    }
  };

  const getButtonConfig = () => {
    const isOneWay = type === 'info' || type === 'success';
    
    return {
      confirmText: confirmText || (isOneWay ? 'OK' : 'Xác nhận'),
      cancelText: cancelText || 'Hủy',
      showCancel: !isOneWay,
    };
  };

  const handleConfirm = () => {
    onConfirm?.();
    if (type === 'info' || type === 'success') {
      onClose?.();
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  const iconConfig = getIconConfig();
  const buttonConfig = getButtonConfig();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.l,
      padding: theme.spacing.xxl,
      width: '95%',
      maxWidth: 500,
    };

    if (type === 'danger') {
      return {
        ...baseStyle,
        borderWidth: 2,
        borderColor: theme.colors.error,
      };
    }

    return baseStyle;
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose || handleCancel}
    >
      <TouchableWithoutFeedback onPress={onClose || handleCancel}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={getContainerStyle()}>
              {/* Header with icon and close button */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={iconConfig.name}
                    size={40}
                    color={iconConfig.color}
                  />
                </View>
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose || handleCancel}
                    style={styles.closeButton}                  
                  >
                    <ThemedIcon
                      name="close"
                      size={24}
                      variant="secondary"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Title */}
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: theme.fontSizes.l,
                    color: theme.colors.textPrimary,
                    fontWeight: theme.fontWeights.bold,
                    marginTop: theme.spacing.m,
                  },
                ]}
              >
                {title}
              </Text>

              {/* Message */}
              {message && (
                <Text
                  style={[
                    styles.message,
                    {
                      fontSize: theme.fontSizes.m,
                      color: theme.colors.textSecondary,
                      marginTop: theme.spacing.s,
                      marginBottom: theme.spacing.l,
                    },
                  ]}
                >
                  {message}
                </Text>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {buttonConfig.showCancel && (
                  <View style={[styles.buttonWrapper, { marginRight: theme.spacing.s }]}>
                    <Button         
                      title={buttonConfig.cancelText}
                      onPress={handleCancel}
                      variant="outline"
                      size="small"
                      style={styles.button}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.buttonWrapper,
                    buttonConfig.showCancel ? { flex: 1 } : { flex: 0 },
                  ]}
                >
                  <Button
                    title={buttonConfig.confirmText}
                    onPress={handleConfirm}
                    variant="primary"
                    size="small"
                    style={styles.button}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
    marginTop: -4,
    marginRight: -4,
  },
  title: {
    textAlign: 'left',
  },
  message: {
    textAlign: 'left',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    flex: 1,
    minHeight: 40,
  },
});

export default Alert;

