import type { Ingredient } from '@/src/api/generated/model';
import { GetIngredientsScope } from '@/src/api/generated/model';
import { useGetIngredients } from '@/src/api/generated/ingredients/ingredients';
import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';
import { Screen } from '@/src/components/Screen';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const formatNutritionPer100 = (ingredient: Ingredient) => {
    return `Na 100 ${ingredient.baseUnit}: ${ingredient.kcalPer100} kcal · B ${ingredient.proteinPer100}g · S ${ingredient.carbsPer100}g · T ${ingredient.fatPer100}g`;
};

const IngredientListItem = ({
    ingredient,
    onPress,
}: {
    ingredient: Ingredient;
    onPress: () => void;
}) => {
    return (
        <Pressable
            accessibilityLabel={`Otevřít ingredienci ${ingredient.name}`}
            accessibilityRole="button"
            style={styles.ingredientItem}
            onPress={onPress}
        >
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
        </Pressable>
    );
};

const Ingredients = () => {
    const router = useRouter();
    const { data, isError, isLoading } = useGetIngredients({
        scope: GetIngredientsScope.all,
    });

    const handleCreateIngredientPress = () => {
        router.push('/ingredients/create');
    };

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
                    <IngredientListItem
                        ingredient={item}
                        onPress={() => {
                            router.push({
                                pathname: '/ingredients/[ingredientId]',
                                params: { ingredientId: item.id },
                            });
                        }}
                    />
                )}
                showsVerticalScrollIndicator={false}
            />
            <FloatingActionMenu
                accessibilityLabel="Přidat ingredienci"
                closedIcon="plus"
                items={[
                    {
                        icon: 'pencil-plus',
                        label: 'Přidat ručně',
                        onPress: handleCreateIngredientPress,
                    },
                    {
                        disabled: true,
                        hint: 'Připravujeme',
                        icon: 'barcode-scan',
                        label: 'Naskenovat kód',
                    },
                ]}
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
        paddingBottom: 96,
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
