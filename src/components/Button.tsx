import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors, Radius, Spacing } from '../constants/Theme';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    mode?: 'filled' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    mode = 'filled',
    size = 'md',
    loading = false,
    disabled = false,
    style,
}) => {
    const isOutline = mode === 'outline';
    const isGhost = mode === 'ghost';

    const getBackgroundColor = () => {
        if (disabled) return Colors.surfaceLight;
        if (isOutline || isGhost) return 'transparent';
        switch (variant) {
            case 'primary': return Colors.primary;
            case 'secondary': return Colors.secondary;
            case 'danger': return Colors.danger;
            default: return Colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return Colors.textMuted;
        if (isGhost) return Colors.text;
        if (isOutline) {
            if (variant === 'secondary') return Colors.secondary;
            if (variant === 'danger') return Colors.danger;
            return Colors.primary;
        }
        return Colors.textInverted;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[
                styles.button,
                styles[size],
                { backgroundColor: getBackgroundColor() },
                isOutline && { borderWidth: 2, borderColor: getTextColor() },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, styles[`text_${size}` as keyof typeof styles], { color: getTextColor() }]}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: Radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
    md: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
    text: { fontWeight: '700', textAlign: 'center' },
    text_sm: { fontSize: 14 },
    text_md: { fontSize: 16 },
    text_lg: { fontSize: 18 },
});
