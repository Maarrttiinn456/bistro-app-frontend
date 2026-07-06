import type { Recipe } from '@/src/api/generated/model';
import { useGetRecipes } from '@/src/api/generated/recipes/recipes';
import { Screen } from '@/src/components/Screen';
import { RecipeAddActionMenu } from '@/src/recipes/RecipeAddActionMenu';
import { formatMealTypes } from '@/src/recipes/recipeFormatters';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const RecipeListItem = ({
    recipe,
    onPress,
}: {
    recipe: Recipe;
    onPress: (recipeId: string) => void;
}) => {
    return (
        <Pressable
            accessibilityRole="button"
            style={styles.recipeItem}
            onPress={() => onPress(recipe.id)}
        >
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeMeta}>
                {recipe.portions} porce · {recipe.prepTimeMin} min
            </Text>
            <Text style={styles.recipeMealTypes}>
                {formatMealTypes(recipe.mealTypes)}
            </Text>
        </Pressable>
    );
};

const Recipes = () => {
    const router = useRouter();
    const { data, isError, isLoading } = useGetRecipes();

    const handleIngredientsPress = () => {
        router.push('/recipes/ingredients');
    };

    const handleRecipePress = (recipeId: string) => {
        router.push({
            pathname: '/recipes/[recipeId]',
            params: { recipeId },
        });
    };

    if (isLoading) {
        return (
            <Screen>
                <View style={styles.stateContainer}>
                    <ActivityIndicator
                        accessibilityLabel="Načítám recepty"
                        testID="recipes-loading-indicator"
                    />
                    <Text style={styles.stateText}>Načítám recepty...</Text>
                </View>
            </Screen>
        );
    }

    if (isError) {
        return (
            <Screen>
                <View style={styles.stateContainer}>
                    <Text style={styles.errorText}>
                        Recepty se nepovedlo načíst.
                    </Text>
                </View>
            </Screen>
        );
    }

    const recipes = data?.recipes ?? [];

    return (
        <Screen>
            <FlatList
                contentContainerStyle={styles.listContent}
                data={recipes}
                keyExtractor={(recipe) => recipe.id}
                ListHeaderComponent={
                    <Pressable
                        accessibilityRole="button"
                        style={styles.ingredientsButton}
                        onPress={handleIngredientsPress}
                    >
                        <Text style={styles.ingredientsButtonText}>
                            Ingredience
                        </Text>
                    </Pressable>
                }
                ListEmptyComponent={
                    <Text style={styles.stateText}>
                        Zatím nemáš žádné recepty.
                    </Text>
                }
                renderItem={({ item }) => (
                    <RecipeListItem recipe={item} onPress={handleRecipePress} />
                )}
                showsVerticalScrollIndicator={false}
            />
            <RecipeAddActionMenu />
        </Screen>
    );
};

const styles = StyleSheet.create({
    errorText: {
        color: '#b42318',
        fontSize: 15,
    },
    listContent: {
        gap: 12,
        paddingBottom: 96,
    },
    ingredientsButton: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 8,
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    ingredientsButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    recipeItem: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
        padding: 14,
    },
    recipeMealTypes: {
        color: '#475467',
        fontSize: 14,
    },
    recipeMeta: {
        color: '#667085',
        fontSize: 14,
    },
    recipeName: {
        color: '#111827',
        fontSize: 17,
        fontWeight: '700',
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
    },
});

export default Recipes;
