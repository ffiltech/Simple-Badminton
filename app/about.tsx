import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius } from '../src/constants/Theme';
import { Typography } from '../src/components/Typography';
import { Card } from '../src/components/Card';
import { ChevronLeft, User, ExternalLink } from 'lucide-react-native';
import { Language, getTranslation } from '../src/logic/i18n';

export default function AboutScreen() {
    const router = useRouter();
    const { lang } = useLocalSearchParams();
    const language = (lang as Language) || 'it';
    const t = getTranslation(language);

    const openBio = () => {
        Linking.openURL('https://filippofranco.it/creation/me');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft color={Colors.text} size={28} />
                </TouchableOpacity>
                <Typography variant="h2">{t.about}</Typography>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.card}>
                    <View style={styles.iconContainer}>
                        <User size={64} color={Colors.primary} />
                    </View>

                    <Typography variant="h1" style={{ textAlign: 'center', marginBottom: Spacing.sm }}>
                        Simple Badminton
                    </Typography>

                    <Typography variant="subtitle" color={Colors.textMuted} style={{ textAlign: 'center', marginBottom: Spacing.xl }}>
                        v1.0.0
                    </Typography>

                    <View style={styles.creatorSection}>
                        <Typography variant="h3" style={{ marginBottom: Spacing.md }}>
                            {t.createdBy}:
                        </Typography>

                        <Typography variant="h2" color={Colors.primary} style={{ marginBottom: Spacing.md }}>
                            Filippo Franco
                        </Typography>

                        <TouchableOpacity
                            style={styles.bioButton}
                            onPress={openBio}
                            activeOpacity={0.7}
                        >
                            <ExternalLink size={20} color={Colors.primary} />
                            <Typography variant="body" color={Colors.primary} style={{ marginLeft: 8 }}>
                                {t.viewBio}
                            </Typography>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <Typography variant="body" color={Colors.textMuted} style={{ textAlign: 'center', lineHeight: 24 }}>
                        {language === 'it'
                            ? 'Un\'app professionale per gestire e tracciare le tue partite di badminton con statistiche dettagliate e supporto multilingua.'
                            : 'A professional app to manage and track your badminton matches with detailed statistics and multi-language support.'}
                    </Typography>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    card: {
        padding: Spacing.xl,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 100,
        alignSelf: 'center',
    },
    creatorSection: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    bioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        backgroundColor: Colors.surfaceLight,
        borderRadius: Radius.lg,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.xl,
    },
});
