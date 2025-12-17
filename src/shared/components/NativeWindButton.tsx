import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface NativeWindButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const NativeWindButton: React.FC<NativeWindButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}) => {
  // Base classes
  const baseClasses = 'rounded-xl items-center justify-center active:opacity-70';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-neon-green',
    secondary: 'bg-dark-black dark:bg-soft-white',
    outline: 'bg-transparent border-2 border-neon-green',
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };
  
  // Text variant classes
  const textVariantClasses = {
    primary: 'text-dark-black font-bold',
    secondary: 'text-soft-white dark:text-dark-black font-bold',
    outline: 'text-foreground font-bold',
  };
  
  // Text size classes
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const buttonClass = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : ''} ${className}`;
  const textClass = `${textVariantClasses[variant]} ${textSizeClasses[size]}`;
  
  return (
    <TouchableOpacity
      className={buttonClass}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#97FB57' : variant === 'primary' ? '#121212' : '#F6F2F2'} 
        />
      ) : (
        <Text className={textClass}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default NativeWindButton;

