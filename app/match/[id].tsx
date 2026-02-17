import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Modal, ScrollView, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../src/constants/Theme';
import { Typography } from '../../src/components/Typography';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { MatchState, INITIAL_MATCH_STATE, addPoint, subtractPoint, addFoul, changeService, PlayerNumber, FoulType } from '../../src/logic/ScoreEngine';
import { saveMatchToHistory } from '../../src/logic/Storage';
import { Undo2, ChevronLeft, Flag, Activity, Plus, Minus, Repeat, Clock } from 'lucide-react-native';
import { Language, getTranslation, getFoulTypeName } from '../../src/logic/i18n';

const FOUL_TYPES: FoulType[] = ['Service', 'Net', 'Out', 'Contact', 'Double', 'Other'];

export default function MatchScreen() {
    const { id, winningScore: paramScore, p1, p2, autoSave, lang } = useLocalSearchParams();
    const router = useRouter();
    const { width, height } = useWindowDimensions();

    const language = (lang as Language) || 'it';
    const t = getTranslation(language);

    const winScore = paramScore ? parseInt(paramScore as string, 10) : 21;
    const p1Name = (p1 as string) || t.player1;
    const p2Name = (p2 as string) || t.player2;
    const shouldAutoSave = autoSave === 'true';

    const [match, setMatch] = useState<MatchState>(INITIAL_MATCH_STATE(p1Name, p2Name, winScore));
    const [history, setHistory] = useState<MatchState[]>([]);
    const [foulModalVisible, setFoulModalVisible] = useState(false);
    const [foulTarget, setFoulTarget] = useState<PlayerNumber | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isLandscape = width > height;

    // Timer effect
    useEffect(() => {
        if (match.status === 'In Progress') {
            timerRef.current = setInterval(() => {
                setElapsedTime(Date.now() - match.startTime);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [match.status, match.startTime]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleAddPoint = (player: PlayerNumber, reason: any = 'Winner') => {
        setHistory([...history, match]);
        const newState = addPoint(match, player, reason);
        setMatch(newState);

        if (newState.status === 'Finished') {
            if (shouldAutoSave) {
                saveMatchToHistory(newState);
            }
            router.replace({
                pathname: `/summary/${newState.id}`,
                params: { matchData: JSON.stringify(newState), lang: language }
            });
        }
    };

    const handleSubtractPoint = (player: PlayerNumber) => {
        setHistory([...history, match]);
        const newState = subtractPoint(match, player);
        setMatch(newState);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setMatch(prev);
            setHistory(history.slice(0, -1));
        }
    };

    const handleManualServiceChange = () => {
        setHistory([...history, match]);
        const newState = changeService(match);
        setMatch(newState);
    };

    const openFoulModal = (player: PlayerNumber) => {
        setFoulTarget(player);
        setFoulModalVisible(true);
    };

    const handleFoul = (type: FoulType) => {
        if (foulTarget) {
            setHistory([...history, match]);
            const newState = addFoul(match, foulTarget, type);
            setMatch(newState);
            setFoulModalVisible(false);
            setFoulTarget(null);

            if (newState.status === 'Finished') {
                if (shouldAutoSave) {
                    saveMatchToHistory(newState);
                }
                router.replace({
                    pathname: `/summary/${newState.id}`,
                    params: { matchData: JSON.stringify(newState), lang: language }
                });
            }
        }
    };

    const currentSet = match.sets[match.currentSet];

    // Combine point history, fouls, and service changes for a complete log
    const getActionLog = () => {
        const events: { label: string; time: number; type: 'point' | 'foul' | 'service' }[] = [];

        currentSet.pointHistory.forEach(p => {
            const pName = p.scoredBy === 1 ? match.player1Name : match.player2Name;
            const reasonText = p.reason === 'Winner' ? t.winner : p.reason === 'Foul' ? t.foul : t.manual;
            events.push({
                label: `${pName} +1 (${reasonText})`,
                time: p.timestamp,
                type: 'point'
            });
        });

        currentSet.fouls.forEach(f => {
            const pName = f.player === 1 ? match.player1Name : match.player2Name;
            events.push({
                label: `${t.foul} ${pName}: ${getFoulTypeName(f.type, language)}`,
                time: f.timestamp,
                type: 'foul'
            });
        });

        currentSet.serviceChanges.forEach(sc => {
            const serverName = sc.newServer === 1 ? match.player1Name : match.player2Name;
            const changeType = sc.reason === 'Auto' ? t.serviceChange : t.manualServiceChange;
            events.push({
                label: `${changeType} → ${serverName}`,
                time: sc.timestamp,
                type: 'service'
            });
        });

        return events.sort((a, b) => b.time - a.time);
    };

    const actionLog = getActionLog();

    const renderPlayerSection = (playerNum: PlayerNumber) => {
        const isPlayer1 = playerNum === 1;
        const playerName = isPlayer1 ? match.player1Name : match.player2Name;
        const score = isPlayer1 ? currentSet.player1Score : currentSet.player2Score;
        const color = isPlayer1 ? Colors.primary : Colors.secondary;
        const isServing = match.currentServer === playerNum;

        return (
            <View style={[styles.playerSection, isLandscape && styles.playerSectionLandscape]}>
                <View style={styles.playerHeader}>
                    <Typography variant="h2" color={color} numberOfLines={1} style={{ flex: 1, textAlign: 'center', fontSize: isLandscape ? 20 : 24 }}>
                        {playerName}
                    </Typography>
                    {isServing && (
                        <View style={styles.servingBadge}>
                            <Typography variant="caption" color={Colors.textInverted} style={{ fontWeight: 'bold', fontSize: 10 }}>
                                {t.serving}
                            </Typography>
                        </View>
                    )}
                </View>

                {/* Score Display - NO TAP TO ADD POINTS */}
                <Typography variant="score" style={[styles.scoreText, isLandscape && styles.scoreTextLandscape]}>{score}</Typography>

                {/* +/- Buttons */}
                <View style={styles.scoreControls}>
                    <TouchableOpacity
                        style={[styles.scoreButton, styles.addButton, isLandscape && styles.scoreButtonLandscape]}
                        onPress={() => handleAddPoint(playerNum)}
                        activeOpacity={0.7}
                    >
                        <Plus size={isLandscape ? 24 : 28} color={Colors.textInverted} strokeWidth={3} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.scoreButton, styles.subtractButton, isLandscape && styles.scoreButtonLandscape]}
                        onPress={() => handleSubtractPoint(playerNum)}
                        activeOpacity={0.7}
                    >
                        <Minus size={isLandscape ? 24 : 28} color={Colors.text} strokeWidth={3} />
                    </TouchableOpacity>
                </View>

                {/* Foul Button */}
                <Button
                    label={t.foul}
                    onPress={() => openFoulModal(playerNum)}
                    variant="danger"
                    size="sm"
                    style={styles.foulBtn}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft color={Colors.text} size={28} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Typography variant="h3">{t.set} {match.currentSet + 1} ({winScore} {t.points})</Typography>
                    <View style={styles.timerContainer}>
                        <Clock size={16} color={Colors.textMuted} />
                        <Typography variant="caption" color={Colors.textMuted} style={{ marginLeft: 6, fontSize: 14, fontWeight: '600' }}>
                            {formatTime(elapsedTime)}
                        </Typography>
                    </View>
                    <TouchableOpacity
                        onPress={handleManualServiceChange}
                        style={styles.serviceChangeButton}
                        activeOpacity={0.7}
                    >
                        <Repeat size={14} color={Colors.primary} />
                        <Typography variant="caption" color={Colors.primary} style={{ marginLeft: 4, fontSize: 11 }}>
                            {t.changeService}
                        </Typography>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleUndo} disabled={history.length === 0}>
                    <Undo2 color={history.length === 0 ? Colors.surfaceLight : Colors.text} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.playersContainer, isLandscape && styles.playersContainerLandscape]}>
                    {renderPlayerSection(1)}

                    {!isLandscape && <View style={styles.divider} />}

                    {renderPlayerSection(2)}
                </View>

                <View style={[styles.matchStats, isLandscape && styles.matchStatsLandscape]}>
                    <Card variant="outline" style={styles.setSummary}>
                        <Typography variant="caption">{t.previousSets}</Typography>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.setsScroll}>
                            {match.sets.slice(0, match.currentSet).map((s, i) => (
                                <View key={i} style={styles.setTag}>
                                    <Typography variant="caption">{s.player1Score} - {s.player2Score}</Typography>
                                </View>
                            ))}
                            {match.currentSet === 0 && <Typography variant="caption" color={Colors.textMuted}>{t.none}</Typography>}
                        </ScrollView>
                    </Card>

                    <Card variant="elevated" style={styles.actionLogCard}>
                        <View style={styles.logHeader}>
                            <Activity size={16} color={Colors.primary} />
                            <Typography variant="caption" style={{ marginLeft: 8 }}>{t.actionLog}</Typography>
                        </View>
                        <ScrollView style={styles.logScroll} nestedScrollEnabled>
                            {actionLog.map((log, i) => (
                                <View key={i} style={styles.logItem}>
                                    <View style={[styles.logDot, {
                                        backgroundColor: log.type === 'point' ? Colors.success :
                                            log.type === 'foul' ? Colors.danger :
                                                Colors.primary
                                    }]} />
                                    <Typography variant="subtitle" style={{ flex: 1, fontSize: 12 }}>{log.label}</Typography>
                                    <Typography variant="caption" color={Colors.textMuted} style={{ fontSize: 10 }}>
                                        {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </View>
                            ))}
                        </ScrollView>
                    </Card>
                </View>
            </ScrollView>

            {/* Foul Modal */}
            <Modal visible={foulModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Flag color={Colors.danger} size={24} />
                            <Typography variant="h2" style={{ marginLeft: 10 }}>{t.reportFoul}</Typography>
                        </View>
                        <Typography variant="body" color={Colors.textMuted} style={{ marginBottom: 20 }}>
                            {t.whoFouled} {foulTarget === 1 ? match.player1Name : match.player2Name}
                        </Typography>

                        <View style={styles.foulGrid}>
                            {FOUL_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={styles.foulOption}
                                    onPress={() => handleFoul(type)}
                                >
                                    <Typography variant="body">{getFoulTypeName(type, language)}</Typography>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Button label={t.cancel} onPress={() => setFoulModalVisible(false)} mode="ghost" style={{ marginTop: 20 }} />
                    </View>
                </View>
            </Modal>
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
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
    },
    serviceChangeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        backgroundColor: Colors.surfaceLight,
        borderRadius: Radius.sm,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: Spacing.xl,
    },
    playersContainer: {
        flexDirection: 'column',
    },
    playersContainerLandscape: {
        flexDirection: 'row',
    },
    playerSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    playerSectionLandscape: {
        flex: 1,
        paddingVertical: Spacing.md,
    },
    playerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
        width: '100%',
    },
    servingBadge: {
        position: 'absolute',
        right: 0,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: Radius.sm,
    },
    scoreText: {
        fontSize: 72,
        marginVertical: Spacing.sm,
    },
    scoreTextLandscape: {
        fontSize: 56,
        marginVertical: Spacing.xs,
    },
    scoreControls: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    scoreButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    scoreButtonLandscape: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    addButton: {
        backgroundColor: Colors.success,
    },
    subtractButton: {
        backgroundColor: Colors.surfaceLight,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.xl,
        marginVertical: Spacing.sm,
    },
    foulBtn: {
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.xs,
    },
    matchStats: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
    },
    matchStatsLandscape: {
        paddingHorizontal: Spacing.lg,
    },
    setSummary: {
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    actionLogCard: {
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        maxHeight: 200,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: 4,
    },
    logScroll: {
        maxHeight: 150,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    logDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    setsScroll: {
        marginTop: Spacing.sm,
    },
    setTag: {
        backgroundColor: Colors.surfaceLight,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.sm,
        marginRight: Spacing.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    foulGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    foulOption: {
        width: '48%',
        backgroundColor: Colors.surfaceLight,
        padding: Spacing.md,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
        alignItems: 'center',
    }
});
