import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../src/constants/Theme';
import { Typography } from '../../src/components/Typography';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { MatchState, FoulEvent } from '../../src/logic/ScoreEngine';
import { getMatchHistory } from '../../src/logic/Storage';
import { Trophy, Info, AlertTriangle, Activity, Share2 } from 'lucide-react-native';
import { Language, getTranslation, getFoulTypeName } from '../../src/logic/i18n';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function SummaryScreen() {
    const { id, matchData, history: fromHistory, lang } = useLocalSearchParams();
    const router = useRouter();
    const [match, setMatch] = useState<MatchState | null>(null);
    const viewShotRef = useRef<ViewShot>(null);

    const language = (lang as Language) || 'it';
    const t = getTranslation(language);

    useEffect(() => {
        if (matchData) {
            try {
                const parsed = JSON.parse(matchData as string);
                setMatch(parsed);
            } catch (e) {
                console.error('Error parsing match data:', e);
            }
        } else if (fromHistory === 'true') {
            loadFromHistory();
        }
    }, [matchData, fromHistory, id]);

    const loadFromHistory = async () => {
        const allMatches = await getMatchHistory();
        const found = allMatches.find(m => m.id === id);
        if (found) setMatch(found);
    };

    const handleShare = async () => {
        try {
            if (viewShotRef.current) {
                const uri = await viewShotRef.current.capture();

                if (Platform.OS === 'ios' || Platform.OS === 'android') {
                    const isAvailable = await Sharing.isAvailableAsync();
                    if (isAvailable) {
                        await Sharing.shareAsync(uri, {
                            mimeType: 'image/png',
                            dialogTitle: t.matchSummary
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error sharing screenshot:', error);
        }
    };

    if (!match) {
        return (
            <SafeAreaView style={styles.container}>
                <Typography variant="body">Loading...</Typography>
            </SafeAreaView>
        );
    }

    const winnerName = match.winner === 1 ? match.player1Name : match.player2Name;
    const p1Sets = match.sets.filter(s => s.player1Score > s.player2Score).length;
    const p2Sets = match.sets.filter(s => s.player2Score > s.player1Score).length;

    const allFouls: (FoulEvent & { setIndex: number })[] = [];
    match.sets.forEach((set, idx) => {
        set.fouls.forEach(f => allFouls.push({ ...f, setIndex: idx }));
    });

    const p1Fouls = allFouls.filter(f => f.player === 1);
    const p2Fouls = allFouls.filter(f => f.player === 2);

    const allActions: { label: string; time: number; setIndex: number }[] = [];
    match.sets.forEach((set, setIdx) => {
        set.pointHistory.forEach(p => {
            const pName = p.scoredBy === 1 ? match.player1Name : match.player2Name;
            const reasonText = p.reason === 'Winner' ? t.winner : p.reason === 'Foul' ? t.foul : t.manual;
            allActions.push({
                label: `${pName} +1 (${reasonText})`,
                time: p.timestamp,
                setIndex: setIdx
            });
        });

        set.fouls.forEach(f => {
            const pName = f.player === 1 ? match.player1Name : match.player2Name;
            allActions.push({
                label: `${t.foul} ${pName}: ${getFoulTypeName(f.type, language)}`,
                time: f.timestamp,
                setIndex: setIdx
            });
        });

        set.serviceChanges?.forEach(sc => {
            const serverName = sc.newServer === 1 ? match.player1Name : match.player2Name;
            const changeType = sc.reason === 'Auto' ? t.serviceChange : t.manualServiceChange;
            allActions.push({
                label: `${changeType} → ${serverName}`,
                time: sc.timestamp,
                setIndex: setIdx
            });
        });
    });

    allActions.sort((a, b) => b.time - a.time);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Typography variant="h2">{t.matchSummary}</Typography>
                <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
                    <Share2 size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
                    <View style={styles.winnerCardContainer}>
                        <Trophy size={64} color={Colors.primary} style={{ marginBottom: Spacing.md }} />
                        <Typography variant="h1">{winnerName} {t.wins}</Typography>
                        <Typography variant="subtitle">{t.matchCompleted} {new Date(match.endTime || 0).toLocaleTimeString()}</Typography>
                    </View>

                    <Card style={styles.setsCard}>
                        <View style={styles.setsHeader}>
                            <Info size={20} color={Colors.primary} />
                            <Typography variant="h3" style={{ marginLeft: 8 }}>{t.sets}</Typography>
                        </View>

                        <View style={styles.setsRow}>
                            <View style={styles.playerSetsColumn}>
                                <Typography variant="h2" color={Colors.primary}>{match.player1Name}</Typography>
                                <Typography variant="body" color={Colors.textMuted}>{p1Sets} {t.sets}</Typography>
                            </View>

                            <Typography variant="h2" color={Colors.textMuted}>{t.vs}</Typography>

                            <View style={styles.playerSetsColumn}>
                                <Typography variant="h2" color={Colors.secondary} style={{ textAlign: 'right' }}>{match.player2Name}</Typography>
                                <Typography variant="body" color={Colors.textMuted} style={{ textAlign: 'right' }}>{p2Sets} {t.sets}</Typography>
                            </View>
                        </View>

                        {match.sets.map((set, i) => (
                            <View key={i} style={styles.setRow}>
                                <Typography variant="body">{t.set} {i + 1}</Typography>
                                <View style={styles.setScores}>
                                    <Typography variant="h3" color={set.player1Score > set.player2Score ? Colors.primary : Colors.textMuted}>
                                        {set.player1Score}
                                    </Typography>
                                    <Typography variant="body" color={Colors.textMuted} style={{ marginHorizontal: Spacing.sm }}>-</Typography>
                                    <Typography variant="h3" color={set.player2Score > set.player1Score ? Colors.secondary : Colors.textMuted}>
                                        {set.player2Score}
                                    </Typography>
                                </View>
                            </View>
                        ))}
                    </Card>

                    <Card style={styles.foulsCard}>
                        <View style={styles.foulsHeader}>
                            <AlertTriangle size={20} color={Colors.danger} />
                            <Typography variant="h3" style={{ marginLeft: 8 }}>{t.foulAnalysis}</Typography>
                        </View>

                        <View style={styles.foulsRow}>
                            <View style={styles.foulColumn}>
                                <Typography variant="h2" color={Colors.primary}>{match.player1Name}</Typography>
                                <Typography variant="body" color={Colors.textMuted}>{p1Fouls.length} {t.fouls}</Typography>
                                {p1Fouls.map((f, i) => (
                                    <View key={i} style={styles.foulItem}>
                                        <View style={[styles.foulDot, { backgroundColor: Colors.danger }]} />
                                        <Typography variant="caption">{getFoulTypeName(f.type, language)}</Typography>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.foulColumn}>
                                <Typography variant="h2" color={Colors.secondary} style={{ textAlign: 'right' }}>{match.player2Name}</Typography>
                                <Typography variant="body" color={Colors.textMuted} style={{ textAlign: 'right' }}>{p2Fouls.length} {t.fouls}</Typography>
                                {p2Fouls.map((f, i) => (
                                    <View key={i} style={[styles.foulItem, { justifyContent: 'flex-end' }]}>
                                        <Typography variant="caption">{getFoulTypeName(f.type, language)}</Typography>
                                        <View style={[styles.foulDot, { backgroundColor: Colors.danger, marginLeft: 8 }]} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Card>
                </ViewShot>

                <Card style={styles.timelineCard}>
                    <View style={styles.timelineHeader}>
                        <Activity size={20} color={Colors.primary} />
                        <Typography variant="h3" style={{ marginLeft: 8 }}>{t.matchTimeline}</Typography>
                    </View>

                    {allActions.length === 0 ? (
                        <Typography variant="body" color={Colors.textMuted}>{t.noActions}</Typography>
                    ) : (
                        allActions.map((action, i) => (
                            <View key={i} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <Typography variant="caption" color={Colors.textMuted}>
                                        {t.set} {action.setIndex + 1}
                                    </Typography>
                                    <Typography variant="caption" color={Colors.textMuted}>
                                        {new Date(action.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </View>
                                <View style={styles.timelineDot} />
                                <View style={styles.timelineRight}>
                                    <Typography variant="body">{action.label}</Typography>
                                </View>
                            </View>
                        ))
                    )}
                </Card>

                <Button
                    label={t.backToHome}
                    onPress={() => router.replace('/')}
                    mode="outline"
                    size="lg"
                    style={{ marginTop: Spacing.lg }}
                />

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
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    shareButton: {
        padding: Spacing.sm,
        backgroundColor: Colors.surfaceLight,
        borderRadius: Radius.md,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    winnerCardContainer: {
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        marginBottom: Spacing.lg,
    },
    setsCard: {
        marginBottom: Spacing.lg,
    },
    setsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    setsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    playerSetsColumn: {
        flex: 1,
    },
    setRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    setScores: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    foulsCard: {
        marginBottom: Spacing.lg,
    },
    foulsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    foulsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    foulColumn: {
        flex: 1,
    },
    foulItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    foulDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    timelineCard: {
        marginBottom: Spacing.lg,
    },
    timelineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    timelineLeft: {
        width: 60,
        alignItems: 'flex-end',
        marginRight: Spacing.md,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        marginRight: Spacing.md,
    },
    timelineRight: {
        flex: 1,
    },
});
