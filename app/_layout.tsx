import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/src/auth/AuthProvider';
import { useAuth } from '@/src/auth/useAuth';
import { queryClient } from '@/src/query/queryClient';

const RootNavigator = () => {
    const { isAuthenticated } = useAuth();
    const activeRouteGroup = isAuthenticated ? '(tabs)' : '(auth)';

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
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <SafeAreaProvider>
                    <RootNavigator />
                </SafeAreaProvider>
            </QueryClientProvider>
        </AuthProvider>
    );
};

export default RootLayout;
