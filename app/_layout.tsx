import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/Theme';

export default function Layout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: Colors.background,
                    },
                    headerTintColor: Colors.text,
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                    headerShadowVisible: false,
                    contentStyle: {
                        backgroundColor: Colors.background,
                    },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'Badminton Manager',
                    }}
                />
                <Stack.Screen
                    name="match/[id]"
                    options={{
                        title: 'Match in Corso',
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="summary/[id]"
                    options={{
                        title: 'Statistiche Partita',
                    }}
                />
            </Stack>
        </>
    );
}
