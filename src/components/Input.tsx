import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/Theme';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Typography variant="caption" style={styles.label}>{label}</Typography>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={Colors.textMuted}
                {...props}
            />
            {error && <Typography variant="caption" color={Colors.danger} style={styles.error}>{error}</Typography>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        width: '100%',
    },
    label: {
        marginBottom: 4,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: Radius.md,
        padding: Spacing.md,
        color: Colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: {
        borderColor: Colors.danger,
    },
    error: {
        marginTop: 4,
        marginLeft: 4,
    },
});
