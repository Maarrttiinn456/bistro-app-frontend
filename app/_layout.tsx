import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/src/query/queryClient';

const showTabsScreens = false;

const RootLayout = () => {
    const activeRouteGroup = showTabsScreens ? '(tabs)' : '(auth)';

    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <Stack
                    initialRouteName={activeRouteGroup}
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Protected guard={!showTabsScreens}>
                        <Stack.Screen name="(auth)" />
                    </Stack.Protected>
                    <Stack.Protected guard={showTabsScreens}>
                        <Stack.Screen name="(tabs)" />
                    </Stack.Protected>
                </Stack>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
};

export default RootLayout;
