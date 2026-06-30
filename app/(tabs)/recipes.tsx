import { MealSlot, type Recipe } from '@/src/api/generated/model';
import { useGetRecipes } from '@/src/api/generated/recipes/recipes';
import { Screen } from '@/src/components/Screen';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const mealSlotLabels: Record<MealSlot, string> = {
    [MealSlot.breakfast]: 'Snídaně',
    [MealSlot.lunch]: 'Oběd',
    [MealSlot.dinner]: 'Večeře',
    [MealSlot.snack]: 'Svačina',
};

const formatMealTypes = (mealTypes: Recipe['mealTypes']) => {
    return mealTypes.map((mealType) => mealSlotLabels[mealType]).join(', ');
};

const renderRecipe = ({ item }: { item: Recipe }) => {
    return (
        <View style={styles.recipeItem}>
            <Text style={styles.recipeName}>{item.name}</Text>
            <Text style={styles.recipeMeta}>
                {item.portions} porce · {item.prepTimeMin} min
            </Text>
            <Text style={styles.recipeMealTypes}>
                {formatMealTypes(item.mealTypes)}
            </Text>
        </View>
    );
};

const Recipes = () => {
    const { data, isError, isLoading } = useGetRecipes();

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
                ListEmptyComponent={
                    <Text style={styles.stateText}>
                        Zatím nemáš žádné recepty.
                    </Text>
                }
                renderItem={renderRecipe}
            />
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
        paddingBottom: 16,
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
