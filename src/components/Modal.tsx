import React, { ReactNode } from 'react';
import { 
  Modal as RNModal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TouchableWithoutFeedback 
} from 'react-native';
import { useTheme } from '../theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  visible, 
  onClose, 
  title, 
  children,
  showCloseButton = true,
}) => {
  const { theme } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { 
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.l,
            }]}>
              {title && (
                <View style={[styles.header, { 
                  padding: theme.spacing.m,
                  borderBottomColor: theme.colors.divider,
                }]}>
                  <Text style={[styles.title, { 
                    fontSize: theme.fontSizes.l,
                    color: theme.colors.text,
                    fontWeight: '600',
                  }]}>{title}</Text>
                  {showCloseButton && (
                    <TouchableOpacity onPress={onClose} style={{ padding: theme.spacing.xs }}>
                      <Text style={[styles.closeText, { 
                        fontSize: theme.fontSizes.xl,
                        color: theme.colors.textSecondary,
                      }]}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={{ padding: theme.spacing.m }}>
                {children}
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
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '600',
  },
  closeText: {
    fontWeight: '400',
  },
});

export default Modal;

