import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/** Ref để navigate từ bên ngoài cây component (vd: notification, deep link handler) */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
