import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useGetIngredient } from '@/src/api/generated/ingredients/ingredients';
import type { Ingredient } from '@/src/api/generated/model';
import { Screen, screenContentStyles } from '@/src/components/Screen';
import { IngredientForm } from '@/src/ingredients/IngredientForm';
import { useUpdateIngredientForm } from '@/src/ingredients/useUpdateIngredientForm';

const normalizeIngredientId = (
    ingredientId: string | string[] | undefined,
) => {
    return Array.isArray(ingredientId) ? ingredientId[0] : ingredientId;
};

const IngredientEditForm = ({
    ingredient,
    onClose,
}: {
    ingredient: Ingredient;
    onClose: () => void;
}) => {
    const form = useUpdateIngredientForm({
        ingredient,
        onIngredientUpdated: onClose,
    });

    return (
        <IngredientForm
            form={form}
            inputLabels={{
                barcode: 'Čárový kód upravované suroviny',
                brand: 'Značka upravované suroviny',
                name: 'Název upravované suroviny',
            }}
            isSubmitting={form.updateIngredientMutation.isPending}
            submitLabel="Uložit změny"
            submittingLabel="Ukládám surovinu..."
            title="Upravit surovinu"
            onClose={onClose}
        />
    );
};

const IngredientEdit = () => {
    const { ingredientId: ingredientIdParam } = useLocalSearchParams<{
        ingredientId?: string | string[];
    }>();
    const router = useRouter();
    const ingredientId = normalizeIngredientId(ingredientIdParam) ?? '';
    const { data, isError, isLoading } = useGetIngredient(ingredientId);

    if (isLoading) {
        return (
            <Screen contentStyle={screenContentStyles.plain}>
                <View style={styles.stateContainer}>
                    <ActivityIndicator
                        accessibilityLabel="Načítám surovinu pro úpravu"
                        testID="ingredient-edit-loading-indicator"
                    />
                    <Text style={styles.stateText}>Načítám surovinu...</Text>
                </View>
            </Screen>
        );
    }

    if (isError || data?.ingredient === undefined) {
        return (
            <Screen contentStyle={screenContentStyles.plain}>
                <View style={styles.stateContainer}>
                    <Text style={styles.errorText}>
                        Surovinu se nepovedlo načíst.
                    </Text>
                </View>
            </Screen>
        );
    }

    return (
        <Screen edges={['top', 'bottom', 'left', 'right']}>
            <IngredientEditForm
                ingredient={data.ingredient}
                onClose={router.back}
            />
        </Screen>
    );
};

const styles = StyleSheet.create({
    errorText: {
        color: '#b42318',
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
});

export default IngredientEdit;
