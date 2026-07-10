import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { getGetIngredientsQueryKey } from '@/src/api/generated/ingredients/ingredients';
import type { Ingredient, MealSlot } from '@/src/api/generated/model';
import {
    getGetRecipesQueryKey,
    useCreateRecipe,
} from '@/src/api/generated/recipes/recipes';
import { consumeCreatedIngredientHandoff } from '@/src/ingredients/createIngredientHandoff';
import {
    buildCreateRecipeBody,
    calculateMacroTotals,
    createIngredientRowId,
    createSelectedIngredientRow,
    type RecipeIngredientRow,
} from '@/src/recipes/createRecipeForm';

type UseCreateRecipeFormParams = {
    onPickIngredient: (params: { rowId: string }) => void;
    onRecipeCreated: (recipeId: string) => void;
};

export const useCreateRecipeForm = ({
    onPickIngredient,
    onRecipeCreated,
}: UseCreateRecipeFormParams) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [prepTimeMin, setPrepTimeMin] = useState('');
    const [portions, setPortions] = useState('1');
    const [mealTypes, setMealTypes] = useState<MealSlot[]>([]);
    const [steps, setSteps] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [ingredientRows, setIngredientRows] = useState<
        RecipeIngredientRow[]
    >([]);
    const [isOptionalDetailsOpen, setIsOptionalDetailsOpen] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const createRecipeMutation = useCreateRecipe();
    const macroTotals = useMemo(
        () => calculateMacroTotals(ingredientRows),
        [ingredientRows],
    );

    const updateIngredientRow = useCallback(
        (rowId: string, updates: Partial<RecipeIngredientRow>) => {
            setIngredientRows((currentIngredientRows) =>
                currentIngredientRows.map((ingredientRow) =>
                    ingredientRow.id === rowId
                        ? { ...ingredientRow, ...updates }
                        : ingredientRow,
                ),
            );
        },
        [],
    );

    const handleIngredientSelect = useCallback(
        (rowId: string, selectedIngredient: Ingredient) => {
            setIngredientRows((currentIngredientRows) => {
                const selectedRow = createSelectedIngredientRow(
                    selectedIngredient,
                    rowId,
                );
                const hasExistingRow = currentIngredientRows.some(
                    (ingredientRow) => ingredientRow.id === rowId,
                );

                if (!hasExistingRow) {
                    return [...currentIngredientRows, selectedRow];
                }

                return currentIngredientRows.map((ingredientRow) =>
                    ingredientRow.id === rowId ? selectedRow : ingredientRow,
                );
            });
        },
        [],
    );

    useFocusEffect(
        useCallback(() => {
            const handoff = consumeCreatedIngredientHandoff(queryClient);

            if (handoff === null) {
                return;
            }

            handleIngredientSelect(handoff.rowId, handoff.ingredient);
        }, [handleIngredientSelect, queryClient]),
    );

    const handleMealTypePress = (mealType: MealSlot) => {
        setMealTypes((currentMealTypes) =>
            currentMealTypes.includes(mealType)
                ? currentMealTypes.filter((item) => item !== mealType)
                : [...currentMealTypes, mealType],
        );
    };

    const handleIngredientModeToggle = (row: RecipeIngredientRow) => {
        const nextMode = row.mode === 'catalog' ? 'freeText' : 'catalog';

        updateIngredientRow(row.id, {
            displayName: nextMode === 'freeText' ? row.searchText : '',
            ingredientId: null,
            mode: nextMode,
            selectedIngredient: null,
        });
    };

    const handleAddIngredientRow = () => {
        onPickIngredient({ rowId: createIngredientRowId() });
    };

    const handleRemoveIngredientRow = (rowId: string) => {
        setIngredientRows((currentIngredientRows) =>
            currentIngredientRows.filter(
                (ingredientRow) => ingredientRow.id !== rowId,
            ),
        );
    };

    const handleToggleDisplayAmount = (rowId: string) => {
        const row = ingredientRows.find(
            (ingredientRow) => ingredientRow.id === rowId,
        );

        if (row === undefined) {
            return;
        }

        updateIngredientRow(rowId, {
            showDisplayAmount: !row.showDisplayAmount,
        });
    };

    const handleSubmit = async () => {
        const result = buildCreateRecipeBody({
            image,
            ingredientRows,
            mealTypes,
            name,
            portions,
            prepTimeMin,
            sourceUrl,
            steps,
        });

        if (result.error !== null) {
            setValidationError(result.error);
            return;
        }

        setValidationError(null);

        try {
            const response = await createRecipeMutation.mutateAsync({
                data: result.body,
            });

            await queryClient.invalidateQueries({
                queryKey: getGetRecipesQueryKey(),
            });
            await queryClient.invalidateQueries({
                queryKey: getGetIngredientsQueryKey(),
            });
            onRecipeCreated(response.recipe.id);
        } catch {
            setValidationError('Recept se nepovedlo vytvořit.');
        }
    };

    return {
        createRecipeMutation,
        image,
        ingredientRows,
        isOptionalDetailsOpen,
        macroTotals,
        mealTypes,
        name,
        portions,
        prepTimeMin,
        sourceUrl,
        steps,
        validationError,
        handleAddIngredientRow,
        handleIngredientModeToggle,
        handleIngredientSelect,
        handleMealTypePress,
        handleRemoveIngredientRow,
        handleSubmit,
        handleToggleDisplayAmount,
        setImage,
        setIsOptionalDetailsOpen,
        setName,
        setPortions,
        setPrepTimeMin,
        setSourceUrl,
        setSteps,
        updateIngredientRow,
    };
};
