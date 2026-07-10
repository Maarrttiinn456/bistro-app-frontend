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
            <Stack.Screen
                name="create"
                options={{
                    presentation: 'formSheet',
                    title: 'Nová surovina',
                    sheetAllowedDetents: [0.9],
                    sheetCornerRadius: 16,
                }}
            />
            <Stack.Screen
                name="scan"
                options={{
                    presentation: 'formSheet',
                    title: 'Skenovat kód',
                    sheetAllowedDetents: [0.9],
                    sheetCornerRadius: 16,
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
