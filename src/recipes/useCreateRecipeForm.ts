import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import {
    getGetIngredientsQueryKey,
    useGetIngredients,
} from '@/src/api/generated/ingredients/ingredients';
import { GetIngredientsScope, type Ingredient, type MealSlot } from '@/src/api/generated/model';
import {
    getGetRecipesQueryKey,
    useCreateRecipe,
} from '@/src/api/generated/recipes/recipes';
import { consumeCreatedIngredientHandoff } from '@/src/ingredients/createIngredientHandoff';
import {
    buildCreateRecipeBody,
    calculateMacroTotals,
    createEmptyIngredientRow,
    type RecipeIngredientRow,
} from '@/src/recipes/createRecipeForm';

type UseCreateRecipeFormParams = {
    onCreateIngredient: (params: { name: string; rowId: string }) => void;
    onScanIngredient: (params: { rowId: string }) => void;
    onRecipeCreated: (recipeId: string) => void;
};

export const useCreateRecipeForm = ({
    onCreateIngredient,
    onScanIngredient,
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
    >([createEmptyIngredientRow()]);
    const [activeIngredientRowId, setActiveIngredientRowId] = useState<
        string | null
    >(null);
    const [isOptionalDetailsOpen, setIsOptionalDetailsOpen] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const activeIngredientRow = ingredientRows.find(
        (ingredientRow) => ingredientRow.id === activeIngredientRowId,
    );
    const activeSearchQuery =
        activeIngredientRow?.mode === 'catalog'
            ? activeIngredientRow.searchText.trim()
            : '';
    const shouldSearchIngredients = activeSearchQuery.length > 0;

    const ingredientsQuery = useGetIngredients(
        {
            query: activeSearchQuery,
            scope: GetIngredientsScope.all,
        },
        {
            query: {
                enabled: shouldSearchIngredients,
            },
        },
    );
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
            updateIngredientRow(rowId, {
                displayName: selectedIngredient.name,
                ingredientId: selectedIngredient.id,
                mode: 'catalog',
                searchText: selectedIngredient.name,
                selectedIngredient,
            });
        },
        [updateIngredientRow],
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

    const handleIngredientSearchChange = (rowId: string, value: string) => {
        setActiveIngredientRowId(rowId);
        updateIngredientRow(rowId, {
            displayName: '',
            ingredientId: null,
            searchText: value,
            selectedIngredient: null,
        });
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
        setIngredientRows((currentIngredientRows) => [
            ...currentIngredientRows,
            createEmptyIngredientRow(),
        ]);
    };

    const handleRemoveIngredientRow = (rowId: string) => {
        setIngredientRows((currentIngredientRows) => {
            if (currentIngredientRows.length === 1) {
                return currentIngredientRows;
            }

            return currentIngredientRows.filter(
                (ingredientRow) => ingredientRow.id !== rowId,
            );
        });
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

    const handleCreateIngredient = (row: RecipeIngredientRow) => {
        onCreateIngredient({
            name: row.searchText.trim() || row.displayName.trim(),
            rowId: row.id,
        });
    };

    const handleScanIngredient = (row: RecipeIngredientRow) => {
        setActiveIngredientRowId(row.id);
        onScanIngredient({ rowId: row.id });
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

    const searchedIngredients = ingredientsQuery.data?.ingredients ?? [];
    const shouldShowIngredientResults =
        activeIngredientRow !== undefined &&
        activeIngredientRow.mode === 'catalog' &&
        shouldSearchIngredients &&
        activeIngredientRow.ingredientId === null;

    return {
        activeIngredientRowId,
        createRecipeMutation,
        image,
        ingredientRows,
        ingredientsQuery,
        isOptionalDetailsOpen,
        macroTotals,
        mealTypes,
        name,
        portions,
        prepTimeMin,
        searchedIngredients,
        shouldShowIngredientResults,
        sourceUrl,
        steps,
        validationError,
        handleAddIngredientRow,
        handleCreateIngredient,
        handleIngredientModeToggle,
        handleIngredientSearchChange,
        handleIngredientSelect,
        handleMealTypePress,
        handleRemoveIngredientRow,
        handleScanIngredient,
        handleSubmit,
        handleToggleDisplayAmount,
        setActiveIngredientRowId,
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
