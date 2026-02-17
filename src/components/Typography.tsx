import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { Typography as TypographyStyles } from '../constants/Theme';

interface CustomTextProps extends TextProps {
    variant?: keyof typeof TypographyStyles;
    color?: string;
}

export const Typography: React.FC<CustomTextProps> = ({
    variant = 'body',
    color,
    style,
    children,
    ...props
}) => {
    const variantStyle = TypographyStyles[variant as keyof typeof TypographyStyles];
    return (
        <Text
            style={[
                styles.base,
                variantStyle,
                color ? { color } : {},
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    base: {
        fontFamily: 'System', // Standard for now, can be changed if google fonts are loaded
    }
});
