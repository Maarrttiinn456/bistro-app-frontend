import { type Macro } from '@/src/api/generated/model';
import { useGetRecipe } from '@/src/api/generated/recipes/recipes';
import { Screen } from '@/src/components/Screen';
import { RecipeDetailActionMenu } from '@/src/recipes/RecipeDetailActionMenu';
import {
    formatIngredientAmount,
    formatMacroValue,
    formatMealTypes,
} from '@/src/recipes/recipeFormatters';
import { useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const macroItems: { key: keyof Macro; label: string; unit: string }[] = [
    { key: 'kcal', label: 'kcal', unit: '' },
    { key: 'protein', label: 'Bílkoviny', unit: 'g' },
    { key: 'carbs', label: 'Sacharidy', unit: 'g' },
    { key: 'fat', label: 'Tuky', unit: 'g' },
];

const normalizeRecipeId = (recipeId: string | string[] | undefined) => {
    return Array.isArray(recipeId) ? recipeId[0] : recipeId;
};

const RecipeDetailScreen = () => {
    const { recipeId: recipeIdParam } = useLocalSearchParams<{
        recipeId?: string | string[];
    }>();
    const recipeId = normalizeRecipeId(recipeIdParam) ?? '';
    const { data, isError, isLoading } = useGetRecipe(recipeId);

    if (isLoading) {
        return (
            <Screen>
                <View style={styles.stateContainer}>
                    <ActivityIndicator
                        accessibilityLabel="Načítám detail receptu"
                        testID="recipe-detail-loading-indicator"
                    />
                    <Text style={styles.stateText}>
                        Načítám detail receptu...
                    </Text>
                </View>
            </Screen>
        );
    }

    if (isError || data?.recipe === undefined) {
        return (
            <Screen>
                <View style={styles.stateContainer}>
                    <Text style={styles.errorText}>
                        Recept se nepovedlo načíst.
                    </Text>
                </View>
            </Screen>
        );
    }

    const { recipe } = data;
    const sortedIngredients = [...recipe.ingredients].sort(
        (firstIngredient, secondIngredient) =>
            firstIngredient.position - secondIngredient.position,
    );
    const trimmedSteps = recipe.steps.trim();

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <Text style={styles.title}>{recipe.name}</Text>
                    <Text style={styles.meta}>
                        {recipe.portions} porce · {recipe.prepTimeMin} min ·{' '}
                        {formatMealTypes(recipe.mealTypes)}
                    </Text>
                    {recipe.sourceUrl ? (
                        <Text style={styles.source}>{recipe.sourceUrl}</Text>
                    ) : null}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Makra</Text>
                    <View style={styles.macroGrid}>
                        {macroItems.map((macroItem) => (
                            <View key={macroItem.key} style={styles.macroItem}>
                                <Text style={styles.macroValue}>
                                    {formatMacroValue(
                                        recipe.macrosTotal[macroItem.key],
                                    )}
                                    {macroItem.unit}
                                </Text>
                                <Text style={styles.macroLabel}>
                                    {macroItem.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredience</Text>
                    {sortedIngredients.length === 0 ? (
                        <Text style={styles.stateText}>
                            Ingredience zatím nejsou vyplněné.
                        </Text>
                    ) : (
                        <View style={styles.ingredientsList}>
                            {sortedIngredients.map((ingredient) => (
                                <View
                                    key={ingredient.id}
                                    style={styles.ingredientRow}
                                >
                                    <Text style={styles.ingredientName}>
                                        {ingredient.displayName}
                                    </Text>
                                    <Text style={styles.ingredientAmount}>
                                        {formatIngredientAmount(ingredient)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Postup</Text>
                    {trimmedSteps ? (
                        <Text style={styles.steps}>{trimmedSteps}</Text>
                    ) : (
                        <Text style={styles.stateText}>
                            Postup zatím není vyplněný.
                        </Text>
                    )}
                </View>
            </ScrollView>
            <RecipeDetailActionMenu recipeId={recipe.id} />
        </Screen>
    );
};

const styles = StyleSheet.create({
    content: {
        gap: 20,
        paddingBottom: 128,
    },
    errorText: {
        color: '#b42318',
        fontSize: 15,
    },
    hero: {
        gap: 8,
    },
    ingredientAmount: {
        color: '#475467',
        fontSize: 14,
    },
    ingredientName: {
        color: '#111827',
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    ingredientRow: {
        alignItems: 'center',
        borderColor: '#eaecf0',
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    ingredientsList: {
        borderBottomColor: '#eaecf0',
        borderBottomWidth: 1,
    },
    macroGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    macroItem: {
        backgroundColor: '#f2f4f7',
        borderRadius: 8,
        minWidth: '48%',
        padding: 12,
    },
    macroLabel: {
        color: '#667085',
        fontSize: 13,
        marginTop: 4,
    },
    macroValue: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '700',
    },
    meta: {
        color: '#475467',
        fontSize: 15,
        lineHeight: 22,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '700',
    },
    source: {
        color: '#175cd3',
        fontSize: 14,
        lineHeight: 20,
    },
    stateContainer: {
        alignItems: 'center',
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    stateText: {
        color: '#475467',
        fontSize: 15,
        lineHeight: 22,
    },
    steps: {
        color: '#344054',
        fontSize: 15,
        lineHeight: 23,
    },
    title: {
        color: '#111827',
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
    },
});

export default RecipeDetailScreen;
