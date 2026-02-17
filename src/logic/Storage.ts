import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchState } from './ScoreEngine';
import { Language } from './i18n';

const HISTORY_KEY = '@badminton_match_history';
const AUTOSAVE_PREF_KEY = '@badminton_autosave_pref';
const LANGUAGE_PREF_KEY = '@badminton_language_pref';

export const saveMatchToHistory = async (match: MatchState) => {
    try {
        const existingHistoryJson = await AsyncStorage.getItem(HISTORY_KEY);
        const history: MatchState[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];

        // Add new match at the beginning
        const newHistory = [match, ...history];
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
        console.error('Error saving match history:', error);
    }
};

export const getMatchHistory = async (): Promise<MatchState[]> => {
    try {
        const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error('Error getting match history:', error);
        return [];
    }
};

export const clearHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};

export const getAutoSavePreference = async (): Promise<boolean> => {
    try {
        const pref = await AsyncStorage.getItem(AUTOSAVE_PREF_KEY);
        return pref === null ? true : pref === 'true'; // Default to true
    } catch (error) {
        console.error('Error getting auto-save preference:', error);
        return true;
    }
};

export const setAutoSavePreference = async (enabled: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(AUTOSAVE_PREF_KEY, enabled.toString());
    } catch (error) {
        console.error('Error setting auto-save preference:', error);
    }
};

export const getLanguagePreference = async (): Promise<Language> => {
    try {
        const lang = await AsyncStorage.getItem(LANGUAGE_PREF_KEY);
        return (lang as Language) || 'it'; // Default to Italian
    } catch (error) {
        console.error('Error getting language preference:', error);
        return 'it';
    }
};

export const setLanguagePreference = async (lang: Language): Promise<void> => {
    try {
        await AsyncStorage.setItem(LANGUAGE_PREF_KEY, lang);
    } catch (error) {
        console.error('Error setting language preference:', error);
    }
};

export const clearAllHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing history:', error);
    }
};
