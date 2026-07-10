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
    RefreshControl,
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
    const { data, isError, isFetching, isLoading, refetch } = useGetRecipes();

    const handleRecipePress = (recipeId: string) => {
        router.push({
            pathname: '/recipes/[recipeId]',
            params: { recipeId },
        });
    };

    const recipes = data?.recipes ?? [];

    const renderEmptyState = () => {
        if (isLoading) {
            return (
                <View style={styles.stateContainer}>
                    <ActivityIndicator accessibilityLabel="Načítám recepty" />
                    <Text style={styles.stateText}>Načítám recepty...</Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.stateContainer}>
                    <Text style={styles.stateText}>
                        Recepty se nepovedlo načíst.
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.stateContainer}>
                <Text style={styles.stateText}>
                    Zatím nemáš žádné recepty.
                </Text>
            </View>
        );
    };

    return (
        <Screen>
            <FlatList
                contentContainerStyle={styles.listContent}
                data={recipes}
                keyExtractor={(recipe) => recipe.id}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                    />
                }
                renderItem={({ item }) => (
                    <RecipeListItem recipe={item} onPress={handleRecipePress} />
                )}
            />
            <RecipeAddActionMenu />
        </Screen>
    );
};

const styles = StyleSheet.create({
    listContent: {
        backgroundColor: '#fff',
        flexGrow: 1,
        gap: 12,
        paddingBottom: 96,
        paddingHorizontal: 16,
        paddingTop: 24,
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
