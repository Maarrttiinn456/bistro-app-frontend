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
            <Stack.Screen name="[recipeId]" options={{ title: 'Recept' }} />
            <Stack.Screen
                name="[recipeId]/edit"
                options={{ title: 'Upravit recept' }}
            />
        </Stack>
    );
};

export default RecipesLayout;
