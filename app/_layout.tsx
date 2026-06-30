import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/auth/AuthProvider';
import { useAuth } from '@/src/auth/useAuth';
import { queryClient } from '@/src/query/queryClient';

const RootNavigator = () => {
    const { isAuthenticated, isRestoringSession } = useAuth();
    const activeRouteGroup = isAuthenticated ? '(tabs)' : '(auth)';

    if (isRestoringSession) {
        return (
            <View style={styles.restoreContainer}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <Stack
            initialRouteName={activeRouteGroup}
            screenOptions={{ headerShown: false }}
        >
            <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>
            <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(tabs)" />
            </Stack.Protected>
        </Stack>
    );
};

const RootLayout = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SafeAreaProvider>
                    <StatusBar backgroundColor="#ffffff" style="dark" />
                    <RootNavigator />
                </SafeAreaProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default RootLayout;

const styles = StyleSheet.create({
    restoreContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
});
