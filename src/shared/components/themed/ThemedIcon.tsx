import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface ThemedIconProps  {
    name:  IconName;
    size?: number;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'white' | 'black';
    color?: string;
}

export const ThemedIcon: React.FC<ThemedIconProps> = ({ name, size, variant,  ...props }) => {
    const { theme } = useTheme();
    const getColor = () => {
     switch (variant) {
        case 'primary':
            return theme.colors.textPrimary;
        case 'secondary':
            return theme.colors.textSecondary;
        case 'tertiary':
            return theme.colors.textTertiary;
        case 'accent':
            return theme.colors.neonGreen;
        case 'white':
            return theme.colors.white;
        case 'black':
            return theme.colors.black;
        default:
            return theme.colors.text;
        
        } 
    };
    
    return( <Ionicons 
                name={name} 
                size={size} 
                color={getColor()}
                {...props}
            />
        );
};