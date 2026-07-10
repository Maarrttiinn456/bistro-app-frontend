import { useGetIngredients } from '@/src/api/generated/ingredients/ingredients';
import type { Ingredient } from '@/src/api/generated/model';
import { GetIngredientsScope } from '@/src/api/generated/model';
import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';
import { Screen } from '@/src/components/Screen';
import { formatIngredientNutritionPer100 } from '@/src/ingredients/ingredientFormatters';
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
                {formatIngredientNutritionPer100(ingredient)}
            </Text>
        </Pressable>
    );
};

const Ingredients = () => {
    const router = useRouter();
    const { data, isError, isFetching, isLoading, refetch } = useGetIngredients({
        scope: GetIngredientsScope.all,
    });

    const handleCreateIngredientPress = () => {
        router.push('/ingredients/create');
    };

    const handleScanIngredientPress = () => {
        router.push('/ingredients/scan');
    };

    const ingredients = data?.ingredients ?? [];

    const renderEmptyState = () => {
        if (isLoading) {
            return (
                <View style={styles.stateContainer}>
                    <ActivityIndicator accessibilityLabel="Načítám ingredience" />
                    <Text style={styles.stateText}>
                        Načítám ingredience...
                    </Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.stateContainer}>
                    <Text style={styles.stateText}>
                        Ingredience se nepovedlo načíst.
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.stateContainer}>
                <Text style={styles.stateText}>
                    Zatím nejsou žádné ingredience.
                </Text>
            </View>
        );
    };

    return (
        <Screen>
            <FlatList
                contentContainerStyle={styles.listContent}
                data={ingredients}
                keyExtractor={(ingredient) => ingredient.id}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={isFetching}
                        onRefresh={refetch}
                    />
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
                        icon: 'barcode-scan',
                        label: 'Naskenovat kód',
                        onPress: handleScanIngredientPress,
                    },
                ]}
            />
        </Screen>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: '#fff',
        flexGrow: 1,
        gap: 12,
        paddingBottom: 96,
        paddingHorizontal: 16,
        paddingTop: 24,
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
