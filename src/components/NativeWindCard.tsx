import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface NativeWindCardProps {
  children: ReactNode;
  className?: string;
}

const NativeWindCard: React.FC<NativeWindCardProps> = ({ children, className = '' }) => {
  return (
    <View className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg ${className}`}>
      {children}
    </View>
  );
};

export default NativeWindCard;

