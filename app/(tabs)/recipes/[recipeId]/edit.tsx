import { Screen } from '@/src/components/Screen';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const normalizeRecipeId = (recipeId: string | string[] | undefined) => {
    return Array.isArray(recipeId) ? recipeId[0] : recipeId;
};

const RecipeEditScreen = () => {
    const { recipeId: recipeIdParam } = useLocalSearchParams<{
        recipeId?: string | string[];
    }>();
    const recipeId = normalizeRecipeId(recipeIdParam);

    return (
        <Screen>
            <View style={styles.content}>
                <Text style={styles.title}>Upravit recept</Text>
                <Text style={styles.text}>
                    Formulář pro úpravu receptu připravíme v dalším kroku.
                </Text>
                {recipeId ? (
                    <Text style={styles.recipeId}>ID receptu: {recipeId}</Text>
                ) : null}
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    content: {
        gap: 10,
    },
    recipeId: {
        color: '#667085',
        fontSize: 13,
    },
    text: {
        color: '#475467',
        fontSize: 15,
        lineHeight: 22,
    },
    title: {
        color: '#111827',
        fontSize: 24,
        fontWeight: '800',
    },
});

export default RecipeEditScreen;
