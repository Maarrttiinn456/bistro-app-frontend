import { Screen } from '@/src/components/Screen';
import { IngredientDetailActionMenu } from '@/src/ingredients/IngredientDetailActionMenu';
import {
    formatIngredientMacroValue,
    ingredientMacroItems,
} from '@/src/ingredients/ingredientFormatters';
import { useIngredientDetail } from '@/src/ingredients/useIngredientDetail';
import { useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const normalizeIngredientId = (
    ingredientId: string | string[] | undefined,
) => {
    return Array.isArray(ingredientId) ? ingredientId[0] : ingredientId;
};

const IngredientDetailScreen = () => {
    const { ingredientId: ingredientIdParam } = useLocalSearchParams<{
        ingredientId?: string | string[];
    }>();
    const ingredientId = normalizeIngredientId(ingredientIdParam) ?? '';
    const { ingredient, isError, isLoading } = useIngredientDetail(ingredientId);

    if (isLoading) {
        return (
            <Screen>
                <View style={styles.stateContainer}>
                    <ActivityIndicator
                        accessibilityLabel="Načítám detail ingredience"
                        testID="ingredient-detail-loading-indicator"
                    />
                    <Text style={styles.stateText}>
                        Načítám detail ingredience...
                    </Text>
                </View>
            </Screen>
        );
    }

    if (isError || ingredient === undefined) {
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

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <Text style={styles.title}>{ingredient.name}</Text>
                    {ingredient.brand ? (
                        <Text style={styles.meta}>{ingredient.brand}</Text>
                    ) : null}
                    <Text style={styles.meta}>
                        Základní jednotka: {ingredient.baseUnit}
                    </Text>
                    {ingredient.barcode ? (
                        <Text style={styles.meta}>
                            Kód: {ingredient.barcode}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Nutriční hodnoty na 100 {ingredient.baseUnit}
                    </Text>
                    <View style={styles.macroGrid}>
                        {ingredientMacroItems.map((macroItem) => (
                            <View key={macroItem.key} style={styles.macroItem}>
                                <Text style={styles.macroValue}>
                                    {formatIngredientMacroValue(
                                        ingredient,
                                        macroItem.key,
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
                    <Text style={styles.sectionTitle}>Porce</Text>
                    {ingredient.servingGrams && ingredient.servingLabel ? (
                        <Text style={styles.stateText}>
                            {ingredient.servingLabel}: {ingredient.servingGrams}{' '}
                            g
                        </Text>
                    ) : (
                        <Text style={styles.stateText}>
                            Porce zatím není vyplněná.
                        </Text>
                    )}
                </View>
            </ScrollView>
            <IngredientDetailActionMenu ingredientId={ingredient.id} />
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
    title: {
        color: '#111827',
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
    },
});

export default IngredientDetailScreen;
