export type Language = 'it' | 'en';

export interface Translations {
    // Home Screen
    appTitle: string;
    appSubtitle: string;
    newMatch: string;
    player1: string;
    player2: string;
    winningScoreLabel: string;
    winningScorePlaceholder: string;
    autoSave: string;
    autoSaveDescription: string;
    startMatch: string;
    recentMatches: string;
    noMatches: string;
    details: string;
    playerName: string;

    // About & Credits
    about: string;
    credits: string;
    createdBy: string;
    viewBio: string;
    madeWith: string;
    libraries: string;
    openSource: string;
    appIcon: string;
    appCode: string;
    aiAgent: string;

    // Match Screen
    set: string;
    points: string;
    serving: string;
    changeService: string;
    foul: string;
    previousSets: string;
    none: string;
    actionLog: string;
    reportFoul: string;
    whoFouled: string;
    cancel: string;
    serviceChange: string;
    manualServiceChange: string;

    // Foul Types
    foulService: string;
    foulNet: string;
    foulOut: string;
    foulContact: string;
    foulDouble: string;
    foulOther: string;

    // Summary Screen
    matchSummary: string;
    wins: string;
    matchCompleted: string;
    sets: string;
    vs: string;
    foulAnalysis: string;
    fouls: string;
    matchTimeline: string;
    noActions: string;
    backToHome: string;

    // Point Reasons
    winner: string;
    manual: string;

    // Common
    and: string;
}

export const translations: Record<Language, Translations> = {
    it: {
        // Home Screen
        appTitle: 'Simple Badminton',
        appSubtitle: 'Impostazioni & Cronologia Partite',
        newMatch: 'Nuova Partita',
        player1: 'Giocatore 1',
        player2: 'Giocatore 2',
        winningScoreLabel: 'Punteggio di vittoria (es. 11, 15, 21):',
        winningScorePlaceholder: 'Punteggio',
        autoSave: 'Salva automaticamente',
        autoSaveDescription: 'Salva la partita nella cronologia',
        startMatch: 'Inizia Match',
        recentMatches: 'Ultime Partite',
        noMatches: 'Nessuna partita registrata',
        details: 'Dettagli',
        playerName: 'Nome',

        // About & Credits
        about: 'Info',
        credits: 'Crediti',
        createdBy: 'Creata da',
        viewBio: 'Visualizza Bio',
        madeWith: 'Realizzata con',
        libraries: 'Librerie',
        openSource: 'Open Source',
        appIcon: 'Icona App',
        appCode: 'Codice App',
        aiAgent: 'Agente IA',

        // Match Screen
        set: 'Set',
        points: 'pt',
        serving: 'BATTE',
        changeService: 'Cambio Battuta',
        foul: 'FALLO',
        previousSets: 'Sets precedenti',
        none: 'Nessuno',
        actionLog: 'Log Azioni',
        reportFoul: 'Segnala Fallo',
        whoFouled: 'Chi ha commesso il fallo?',
        cancel: 'Annulla',
        serviceChange: 'Cambio Battuta',
        manualServiceChange: 'Cambio Battuta Manuale',

        // Foul Types
        foulService: 'Servizio',
        foulNet: 'Rete',
        foulOut: 'Fuori',
        foulContact: 'Contatto',
        foulDouble: 'Doppio',
        foulOther: 'Altro',

        // Summary Screen
        matchSummary: 'Riepilogo Partita',
        wins: 'Vince!',
        matchCompleted: 'Partita conclusa il',
        sets: 'Sets',
        vs: 'VS',
        foulAnalysis: 'Analisi Falli',
        fouls: 'Falli',
        matchTimeline: 'Timeline Match',
        noActions: 'Nessuna azione registrata',
        backToHome: 'Torna alla Home',

        // Point Reasons
        winner: 'Punto',
        manual: 'Manuale',

        // Common
        and: 'e',
    },
    en: {
        // Home Screen
        appTitle: 'Simple Badminton',
        appSubtitle: 'Settings & Match History',
        newMatch: 'New Match',
        player1: 'Player 1',
        player2: 'Player 2',
        winningScoreLabel: 'Winning score (e.g. 11, 15, 21):',
        winningScorePlaceholder: 'Score',
        autoSave: 'Auto-save',
        autoSaveDescription: 'Save match to history',
        startMatch: 'Start Match',
        recentMatches: 'Recent Matches',
        noMatches: 'No matches recorded',
        details: 'Details',
        playerName: 'Name',

        // About & Credits
        about: 'About',
        credits: 'Credits',
        createdBy: 'Created by',
        viewBio: 'View Bio',
        madeWith: 'Made with',
        libraries: 'Libraries',
        openSource: 'Open Source',
        appIcon: 'App Icon',
        appCode: 'App Code',
        aiAgent: 'AI Agent',

        // Match Screen
        set: 'Set',
        points: 'pts',
        serving: 'SERVING',
        changeService: 'Change Service',
        foul: 'FOUL',
        previousSets: 'Previous sets',
        none: 'None',
        actionLog: 'Action Log',
        reportFoul: 'Report Foul',
        whoFouled: 'Who committed the foul?',
        cancel: 'Cancel',
        serviceChange: 'Service Change',
        manualServiceChange: 'Manual Service Change',

        // Foul Types
        foulService: 'Service',
        foulNet: 'Net',
        foulOut: 'Out',
        foulContact: 'Contact',
        foulDouble: 'Double',
        foulOther: 'Other',

        // Summary Screen
        matchSummary: 'Match Summary',
        wins: 'Wins!',
        matchCompleted: 'Match completed at',
        sets: 'Sets',
        vs: 'VS',
        foulAnalysis: 'Foul Analysis',
        fouls: 'Fouls',
        matchTimeline: 'Match Timeline',
        noActions: 'No actions recorded',
        backToHome: 'Back to Home',

        // Point Reasons
        winner: 'Point',
        manual: 'Manual',

        // Common
        and: 'and',
    }
};

export const getTranslation = (lang: Language): Translations => {
    return translations[lang];
};

export const getFoulTypeName = (type: string, lang: Language): string => {
    const t = translations[lang];
    const foulMap: Record<string, string> = {
        'Service': lang === 'it' ? 'Servizio' : 'Service',
        'Net': lang === 'it' ? 'Rete' : 'Net',
        'Out': lang === 'it' ? 'Fuori' : 'Out',
        'Contact': lang === 'it' ? 'Contatto' : 'Contact',
        'Double': lang === 'it' ? 'Doppio' : 'Double',
        'Other': lang === 'it' ? 'Altro' : 'Other',
    };
    return foulMap[type] || type;
};
