import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Spacing, Radius } from '../src/constants/Theme';
import { Typography } from '../src/components/Typography';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { Input } from '../src/components/Input';
import { getMatchHistory, clearHistory, getAutoSavePreference, setAutoSavePreference, getLanguagePreference, setLanguagePreference, clearAllHistory } from '../src/logic/Storage';
import { MatchState } from '../src/logic/ScoreEngine';
import { History, Trophy, Save, Info, Award, Plus, Minus } from 'lucide-react-native';
import { Language, getTranslation } from '../src/logic/i18n';

export default function HomeScreen() {
    const [history, setHistory] = useState<MatchState[]>([]);
    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');
    const [winningScore, setWinningScore] = useState(21);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [language, setLanguage] = useState<Language>('it');
    const router = useRouter();

    const t = getTranslation(language);

    useEffect(() => {
        loadAutoSavePreference();
        loadLanguagePreference();
    }, []);

    // Reload history whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        const data = await getMatchHistory();
        setHistory(data);
    };

    const loadAutoSavePreference = async () => {
        const pref = await getAutoSavePreference();
        setAutoSaveEnabled(pref);
    };

    const loadLanguagePreference = async () => {
        const lang = await getLanguagePreference();
        setLanguage(lang);
        // Set default player names based on language
        setPlayer1Name(lang === 'it' ? 'Giocatore 1' : 'Player 1');
        setPlayer2Name(lang === 'it' ? 'Giocatore 2' : 'Player 2');
    };

    const handleAutoSaveToggle = async (value: boolean) => {
        setAutoSaveEnabled(value);
        await setAutoSavePreference(value);
    };

    const handleLanguageToggle = async () => {
        const newLang: Language = language === 'it' ? 'en' : 'it';
        setLanguage(newLang);
        await setLanguagePreference(newLang);
        // Update default player names
        setPlayer1Name(newLang === 'it' ? 'Giocatore 1' : 'Player 1');
        setPlayer2Name(newLang === 'it' ? 'Giocatore 2' : 'Player 2');
    };

    const startNewMatch = () => {
        const newMatchId = Date.now().toString();
        router.push({
            pathname: `/match/${newMatchId}`,
            params: {
                winningScore: winningScore.toString(),
                p1: player1Name || (language === 'it' ? 'Giocatore 1' : 'Player 1'),
                p2: player2Name || (language === 'it' ? 'Giocatore 2' : 'Player 2'),
                autoSave: autoSaveEnabled.toString(),
                lang: language
            }
        });
    };

    const incrementScore = () => {
        setWinningScore(prev => prev + 1);
    };

    const decrementScore = () => {
        setWinningScore(prev => prev > 1 ? prev - 1 : 1);
    };

    const renderHistoryItem = ({ item }: { item: MatchState }) => {
        const p1Sets = item.sets.filter(s => s.player1Score > s.player2Score).length;
        const p2Sets = item.sets.filter(s => s.player2Score > s.player1Score).length;

        return (
            <Card style={styles.historyCard} variant="elevated">
                <View style={styles.matchInfo}>
                    <View style={styles.playerColumn}>
                        <Typography variant="h3">{item.player1Name}</Typography>
                        <Typography variant="body" color={item.winner === 1 ? Colors.primary : Colors.textMuted}>
                            {t.sets}: {p1Sets}
                        </Typography>
                    </View>

                    <View style={styles.scoreContainer}>
                        <Typography variant="caption" style={{ marginBottom: 4 }}>{t.vs}</Typography>
                    </View>

                    <View style={styles.playerColumn}>
                        <Typography variant="h3" style={{ textAlign: 'right' }}>{item.player2Name}</Typography>
                        <Typography variant="body" color={item.winner === 2 ? Colors.primary : Colors.textMuted} style={{ textAlign: 'right' }}>
                            {t.sets}: {p2Sets}
                        </Typography>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Typography variant="caption">
                        {new Date(item.startTime).toLocaleDateString()}
                    </Typography>
                    <Button
                        label={t.details}
                        onPress={() => router.push(`/summary/${item.id}?history=true&lang=${language}`)}
                        mode="ghost"
                        size="sm"
                    />
                </View>
            </Card>
        );
    };

    // Flag emoji for opposite language
    const flagEmoji = language === 'it' ? '🇬🇧' : '🇮🇹';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Typography variant="h1">{t.appTitle}</Typography>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => router.push(`/about?lang=${language}`)} style={styles.iconButton}>
                        <Info size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push(`/credits?lang=${language}`)} style={styles.iconButton}>
                        <Award size={22} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLanguageToggle} style={styles.languageButton}>
                        <Typography style={{ fontSize: 28 }}>{flagEmoji}</Typography>
                    </TouchableOpacity>
                </View>
            </View>
            <Typography variant="subtitle" style={{ paddingHorizontal: Spacing.lg, marginTop: -Spacing.sm }}>
                {t.appSubtitle}
            </Typography>

            <ScrollView contentContainerStyle={styles.scrollPadding}>
                <Card style={styles.statsOverview}>
                    <View style={styles.headerRow}>
                        <Trophy size={20} color={Colors.primary} />
                        <Typography variant="h3" style={{ marginLeft: 8 }}>{t.newMatch}</Typography>
                    </View>

                    <View style={styles.namesRow}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label={t.player1}
                                value={player1Name}
                                onChangeText={setPlayer1Name}
                                placeholder={t.playerName}
                            />
                        </View>
                        <View style={{ width: Spacing.md }} />
                        <View style={{ flex: 1 }}>
                            <Input
                                label={t.player2}
                                value={player2Name}
                                onChangeText={setPlayer2Name}
                                placeholder={t.playerName}
                                style={{ textAlign: 'right' }}
                            />
                        </View>
                    </View>

                    <Typography variant="body" color={Colors.textMuted} style={{ marginBottom: Spacing.sm }}>
                        {t.winningScoreLabel}
                    </Typography>

                    <View style={styles.scoreSelector}>
                        <TouchableOpacity
                            style={styles.scoreButton}
                            onPress={decrementScore}
                            activeOpacity={0.7}
                        >
                            <Minus size={24} color={Colors.text} strokeWidth={2} />
                        </TouchableOpacity>

                        <View style={styles.scoreDisplay}>
                            <Typography variant="h1" style={{ fontSize: 40 }}>{winningScore}</Typography>
                        </View>

                        <TouchableOpacity
                            style={styles.scoreButton}
                            onPress={incrementScore}
                            activeOpacity={0.7}
                        >
                            <Plus size={24} color={Colors.text} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.autoSaveRow}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Save size={16} color={Colors.primary} />
                                <Typography variant="body" style={{ marginLeft: 8 }}>{t.autoSave}</Typography>
                            </View>
                            <Typography variant="caption" color={Colors.textMuted}>{t.autoSaveDescription}</Typography>
                        </View>
                        <Switch
                            value={autoSaveEnabled}
                            onValueChange={handleAutoSaveToggle}
                            trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
                            thumbColor={Colors.surface}
                        />
                    </View>

                    <Button
                        label={t.startMatch}
                        onPress={startNewMatch}
                        size="lg"
                        style={styles.newMatchButton}
                    />
                </Card>

                <View style={styles.historyHeader}>
                    <History size={20} color={Colors.textMuted} />
                    <Typography variant="h3" style={{ marginLeft: 8 }}>{t.recentMatches}</Typography>
                </View>

                {history.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Typography variant="body" color={Colors.textMuted}>{t.noMatches}</Typography>
                    </View>
                ) : (
                    history.map(item => (
                        <View key={item.id}>
                            {renderHistoryItem({ item })}
                        </View>
                    ))
                )}

                <View style={{ height: 100 }} />
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
        paddingBottom: Spacing.sm,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    iconButton: {
        padding: Spacing.xs,
        backgroundColor: Colors.surfaceLight,
        borderRadius: Radius.md,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageButton: {
        padding: Spacing.xs,
    },
    scrollPadding: {
        paddingBottom: 20,
    },
    statsOverview: {
        margin: Spacing.lg,
        marginTop: Spacing.md,
        backgroundColor: Colors.surface,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    namesRow: {
        flexDirection: 'row',
        marginBottom: Spacing.sm,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    historyCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    matchInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    playerColumn: {
        flex: 1,
    },
    scoreContainer: {
        paddingHorizontal: Spacing.md,
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    emptyState: {
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    newMatchButton: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    autoSaveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        borderRadius: Radius.md,
    },
    scoreSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.lg,
    },
    scoreButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    scoreDisplay: {
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
});
