import type { Ingredient } from '@/src/api/generated/model';
import { GetIngredientsScope } from '@/src/api/generated/model';
import { useGetIngredients } from '@/src/api/generated/ingredients/ingredients';
import { Screen } from '@/src/components/Screen';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const formatNutritionPer100 = (ingredient: Ingredient) => {
    return `Na 100 ${ingredient.baseUnit}: ${ingredient.kcalPer100} kcal · B ${ingredient.proteinPer100}g · S ${ingredient.carbsPer100}g · T ${ingredient.fatPer100}g`;
};

const IngredientListItem = ({ ingredient }: { ingredient: Ingredient }) => {
    return (
        <View style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            {ingredient.brand ? (
                <Text style={styles.ingredientBrand}>{ingredient.brand}</Text>
            ) : null}
            <Text style={styles.ingredientMeta}>
                Jednotka: {ingredient.baseUnit}
            </Text>
            <Text style={styles.ingredientNutrition}>
                {formatNutritionPer100(ingredient)}
            </Text>
        </View>
    );
};

const Ingredients = () => {
    const { data, isError, isLoading } = useGetIngredients({
        scope: GetIngredientsScope.all,
    });

    if (isLoading) {
        return (
            <Screen>
                <View style={styles.stateContainer}>
                    <ActivityIndicator
                        accessibilityLabel="Načítám ingredience"
                        testID="ingredients-loading-indicator"
                    />
                    <Text style={styles.stateText}>
                        Načítám ingredience...
                    </Text>
                </View>
            </Screen>
        );
    }

    if (isError) {
        return (
            <Screen>
                <View style={styles.stateContainer}>
                    <Text style={styles.errorText}>
                        Ingredience se nepovedlo načíst.
                    </Text>
                </View>
            </Screen>
        );
    }

    const ingredients = data?.ingredients ?? [];

    return (
        <Screen>
            <FlatList
                contentContainerStyle={styles.listContent}
                data={ingredients}
                keyExtractor={(ingredient) => ingredient.id}
                ListEmptyComponent={
                    <Text style={styles.stateText}>
                        Zatím nejsou žádné ingredience.
                    </Text>
                }
                renderItem={({ item }) => (
                    <IngredientListItem ingredient={item} />
                )}
                showsVerticalScrollIndicator={false}
            />
        </Screen>
    );
};

const styles = StyleSheet.create({
    errorText: {
        color: '#b42318',
        fontSize: 15,
    },
    ingredientBrand: {
        color: '#667085',
        fontSize: 14,
    },
    ingredientItem: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
        padding: 14,
    },
    ingredientMeta: {
        color: '#475467',
        fontSize: 14,
    },
    ingredientName: {
        color: '#111827',
        fontSize: 17,
        fontWeight: '700',
    },
    ingredientNutrition: {
        color: '#475467',
        fontSize: 14,
    },
    listContent: {
        gap: 12,
        paddingBottom: 24,
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

export default Ingredients;
