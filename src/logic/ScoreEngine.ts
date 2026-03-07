export type PlayerNumber = 1 | 2;

export interface SetStats {
    player1Score: number;
    player2Score: number;
    fouls: FoulEvent[];
    pointHistory: PointEvent[];
    serviceChanges: ServiceChangeEvent[];
}

export type FoulType = 'Service' | 'Net' | 'Out' | 'Contact' | 'Double' | 'Other';

export interface FoulEvent {
    player: PlayerNumber;
    type: FoulType;
    timestamp: number;
}

export interface PointEvent {
    scoredBy: PlayerNumber;
    reason: 'Winner' | 'Foul' | 'Manual';
    timestamp: number;
}

export interface ServiceChangeEvent {
    newServer: PlayerNumber;
    reason: 'Auto' | 'Manual';
    timestamp: number;
}

export interface MatchState {
    id: string;
    startTime: number;
    endTime?: number;
    player1Name: string;
    player2Name: string;
    currentSet: number;
    sets: SetStats[];
    winner?: PlayerNumber;
    status: 'In Progress' | 'Finished';
    winningScore: number; // New: allow custom winning score (e.g. 15 or 21)
    currentServer: PlayerNumber; // Who is currently serving
    servicePointCounter: number; // Points scored since last service change
}

export const INITIAL_MATCH_STATE = (p1Name: string, p2Name: string, winningScore: number = 21): MatchState => ({
    id: Date.now().toString(),
    startTime: Date.now(),
    player1Name: p1Name || 'Player 1',
    player2Name: p2Name || 'Player 2',
    currentSet: 0,
    sets: [{ player1Score: 0, player2Score: 0, fouls: [], pointHistory: [], serviceChanges: [] }],
    status: 'In Progress',
    winningScore,
    currentServer: 1, // Player 1 serves first
    servicePointCounter: 0,
});

export const addPoint = (state: MatchState, player: PlayerNumber, reason: PointEvent['reason'] = 'Winner'): MatchState => {
    if (state.status === 'Finished') return state;

    const newState = { ...state, sets: [...state.sets] };
    const currentSet = newState.sets[state.currentSet];

    const updatedSet = { ...currentSet };
    if (player === 1) updatedSet.player1Score++;
    else updatedSet.player2Score++;

    updatedSet.pointHistory = [...updatedSet.pointHistory, { scoredBy: player, reason, timestamp: Date.now() }];
    newState.sets[state.currentSet] = updatedSet;

    // Handle service rotation
    const s1 = updatedSet.player1Score;
    const s2 = updatedSet.player2Score;
    const winScore = state.winningScore;

    // In deuce mode (both players 1 point from winning score), service alternates every single point
    const inDeuceMode = s1 >= winScore - 1 && s2 >= winScore - 1;

    if (inDeuceMode) {
        // Always change server after every point in deuce mode
        newState.currentServer = newState.currentServer === 1 ? 2 : 1;
        newState.servicePointCounter = 0;

        updatedSet.serviceChanges = [...updatedSet.serviceChanges, {
            newServer: newState.currentServer,
            reason: 'Auto',
            timestamp: Date.now()
        }];
        newState.sets[state.currentSet] = updatedSet;
    } else {
        newState.servicePointCounter++;
        if (newState.servicePointCounter >= 2) {
            newState.currentServer = newState.currentServer === 1 ? 2 : 1;
            newState.servicePointCounter = 0;

            // Log service change (skip if both players at 0)
            if (s1 > 0 || s2 > 0) {
                updatedSet.serviceChanges = [...updatedSet.serviceChanges, {
                    newServer: newState.currentServer,
                    reason: 'Auto',
                    timestamp: Date.now()
                }];
                newState.sets[state.currentSet] = updatedSet;
            }
        }
    }

    // Check if set is over (default 21, or custom. Deuce still applies until max 30)
    const isSetOver = (s1 >= winScore || s2 >= winScore) && (Math.abs(s1 - s2) >= 2 || s1 === 30 || s2 === 30);

    if (isSetOver) {
        const setWinner = s1 > s2 ? 1 : 2;
        // Proper win count
        let p1Wins = 0;
        let p2Wins = 0;
        newState.sets.forEach((s, i) => {
            const winner = i === state.currentSet ? setWinner : (s.player1Score > s.player2Score ? 1 : 2);
            if (winner === 1) p1Wins++; else p2Wins++;
        });

        if (p1Wins === 2 || p2Wins === 2) {
            newState.status = 'Finished';
            newState.winner = p1Wins === 2 ? 1 : 2;
            newState.endTime = Date.now();
        } else {
            newState.currentSet++;
            newState.sets.push({ player1Score: 0, player2Score: 0, fouls: [], pointHistory: [], serviceChanges: [] });
            // Reset service for new set - player 1 serves first
            newState.currentServer = 1;
            newState.servicePointCounter = 0;
        }
    }

    return newState;
};

export const subtractPoint = (state: MatchState, player: PlayerNumber): MatchState => {
    const newState = { ...state, sets: [...state.sets] };
    const currentSet = { ...newState.sets[state.currentSet] };

    if (player === 1 && currentSet.player1Score > 0) currentSet.player1Score--;
    else if (player === 2 && currentSet.player2Score > 0) currentSet.player2Score--;
    else return state; // No point to subtract

    // Determine if the resulting score is still in deuce mode
    const s1 = currentSet.player1Score;
    const s2 = currentSet.player2Score;
    const winScore = state.winningScore;
    const inDeuceMode = s1 >= winScore - 1 && s2 >= winScore - 1;

    if (inDeuceMode) {
        // In deuce mode, every point swaps server, so undoing a point swaps back
        newState.currentServer = newState.currentServer === 1 ? 2 : 1;
        newState.servicePointCounter = 0;
    } else {
        // Handle service state reversal for normal mode
        newState.servicePointCounter--;
        if (newState.servicePointCounter < 0) {
            // Revert to previous server
            newState.currentServer = newState.currentServer === 1 ? 2 : 1;
            newState.servicePointCounter = 1;
        }
    }

    newState.sets[state.currentSet] = currentSet;
    return newState;
};

export const changeService = (state: MatchState): MatchState => {
    const newState = { ...state, sets: [...state.sets] };
    const currentSet = { ...newState.sets[state.currentSet] };

    newState.currentServer = newState.currentServer === 1 ? 2 : 1;
    newState.servicePointCounter = 0;

    // Log manual service change
    currentSet.serviceChanges = [...currentSet.serviceChanges, {
        newServer: newState.currentServer,
        reason: 'Manual',
        timestamp: Date.now()
    }];
    newState.sets[state.currentSet] = currentSet;

    return newState;
};

export const addFoul = (state: MatchState, player: PlayerNumber, type: FoulType): MatchState => {
    const newState = { ...state, sets: [...state.sets] };
    const currentSet = { ...newState.sets[state.currentSet] };

    currentSet.fouls = [...currentSet.fouls, { player, type, timestamp: Date.now() }];
    newState.sets[state.currentSet] = currentSet;

    // In badminton, a foul by player A usually gives a point to player B
    return addPoint(newState, player === 1 ? 2 : 1, 'Foul');
};
