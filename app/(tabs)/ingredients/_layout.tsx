import { Stack } from 'expo-router';

const IngredientsLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShadowVisible: true,
                headerStyle: { backgroundColor: '#ffffff' },
                headerTintColor: '#111827',
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    color: '#111827',
                    fontSize: 18,
                    fontWeight: '700',
                },
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Ingredience' }} />
            <Stack.Screen name="create" options={{ title: 'Nová surovina' }} />
            <Stack.Screen
                name="scan"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                    title: 'Skenovat kod',
                }}
            />
            <Stack.Screen
                name="[ingredientId]"
                options={{ title: 'Detail ingredience' }}
            />
        </Stack>
    );
};

export default IngredientsLayout;
