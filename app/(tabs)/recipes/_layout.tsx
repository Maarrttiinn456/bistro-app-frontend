import { Stack } from 'expo-router';

const RecipesLayout = () => {
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
            <Stack.Screen name="index" options={{ title: 'Recepty' }} />
            <Stack.Screen
                name="create"
                options={{ title: 'Nový recept' }}
            />
            <Stack.Screen
                name="ingredient-picker"
                options={{
                    presentation: 'formSheet',
                    title: 'Přidat surovinu',
                    sheetAllowedDetents: [0.9],
                    sheetCornerRadius: 16,
                }}
            />
            <Stack.Screen
                name="ingredient-create"
                options={{
                    presentation: 'formSheet',
                    title: 'Nová surovina',
                    sheetAllowedDetents: [0.9],
                    sheetCornerRadius: 16,
                }}
            />
            <Stack.Screen
                name="ingredient-scan"
                options={{
                    presentation: 'formSheet',
                    title: 'Skenovat kód',
                    sheetAllowedDetents: [0.9],
                    sheetCornerRadius: 16,
                }}
            />
            <Stack.Screen name="[recipeId]" options={{ title: 'Recept' }} />
            <Stack.Screen
                name="[recipeId]/edit"
                options={{ title: 'Upravit recept' }}
            />
        </Stack>
    );
};

export default RecipesLayout;
