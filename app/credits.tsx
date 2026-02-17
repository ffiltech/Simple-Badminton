import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius } from '../src/constants/Theme';
import { Typography } from '../src/components/Typography';
import { Card } from '../src/components/Card';
import { ChevronLeft, ExternalLink, Package, Sparkles, Code2, Image } from 'lucide-react-native';
import { Language, getTranslation } from '../src/logic/i18n';

export default function CreditsScreen() {
    const router = useRouter();
    const { lang } = useLocalSearchParams();
    const language = (lang as Language) || 'it';
    const t = getTranslation(language);

    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    const libraries = [
        { name: 'React Native', url: 'https://reactnative.dev', license: 'MIT' },
        { name: 'Expo', url: 'https://expo.dev', license: 'MIT' },
        { name: 'Expo Router', url: 'https://docs.expo.dev/router/introduction/', license: 'MIT' },
        { name: 'React Native AsyncStorage', url: 'https://react-native-async-storage.github.io/async-storage/', license: 'MIT' },
        { name: 'Lucide React Native', url: 'https://lucide.dev', license: 'ISC' },
        { name: 'React Native View Shot', url: 'https://github.com/gre/react-native-view-shot', license: 'MIT' },
        { name: 'Expo Sharing', url: 'https://docs.expo.dev/versions/latest/sdk/sharing/', license: 'MIT' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft color={Colors.text} size={28} />
                </TouchableOpacity>
                <Typography variant="h2">{t.credits}</Typography>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Made With Section */}
                <Card style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Sparkles size={20} color={Colors.primary} />
                        <Typography variant="h3" style={{ marginLeft: 8 }}>{t.madeWith}</Typography>
                    </View>

                    <View style={styles.creditItem}>
                        <View style={styles.creditIcon}>
                            <Image size={24} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="body" style={{ fontWeight: 'bold' }}>{t.appIcon}</Typography>
                            <Typography variant="caption" color={Colors.textMuted}>
                                {language === 'it' ? 'Realizzata con' : 'Created with'} Google Gemini
                            </Typography>
                        </View>
                    </View>

                    <View style={styles.creditItem}>
                        <View style={styles.creditIcon}>
                            <Code2 size={24} color={Colors.secondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="body" style={{ fontWeight: 'bold' }}>{t.appCode}</Typography>
                            <Typography variant="caption" color={Colors.textMuted}>
                                {language === 'it' ? 'Sviluppata con' : 'Developed with'} Antigravity
                            </Typography>
                        </View>
                    </View>

                    <View style={styles.creditItem}>
                        <View style={styles.creditIcon}>
                            <Sparkles size={24} color={Colors.success} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="body" style={{ fontWeight: 'bold' }}>{t.aiAgent}</Typography>
                            <Typography variant="caption" color={Colors.textMuted}>
                                Claude Sonnet 4.5
                            </Typography>
                        </View>
                    </View>
                </Card>

                {/* Open Source Libraries */}
                <Card style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <Package size={20} color={Colors.primary} />
                        <Typography variant="h3" style={{ marginLeft: 8 }}>{t.openSource} {t.libraries}</Typography>
                    </View>

                    {libraries.map((lib, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.libraryItem}
                            onPress={() => openLink(lib.url)}
                            activeOpacity={0.7}
                        >
                            <View style={{ flex: 1 }}>
                                <Typography variant="body" style={{ fontWeight: 'bold' }}>{lib.name}</Typography>
                                <Typography variant="caption" color={Colors.textMuted}>
                                    {lib.license} License
                                </Typography>
                            </View>
                            <ExternalLink size={18} color={Colors.primary} />
                        </TouchableOpacity>
                    ))}
                </Card>

                <View style={styles.footer}>
                    <Typography variant="caption" color={Colors.textMuted} style={{ textAlign: 'center' }}>
                        {language === 'it'
                            ? 'Grazie a tutti i contributori open source che hanno reso possibile questa app.'
                            : 'Thanks to all open source contributors who made this app possible.'}
                    </Typography>
                </View>

                <View style={{ height: 50 }} />
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
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    creditItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        padding: Spacing.md,
        backgroundColor: Colors.surfaceLight,
        borderRadius: Radius.md,
    },
    creditIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    libraryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    footer: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
});
