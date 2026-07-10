import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useGetIngredients } from '@/src/api/generated/ingredients/ingredients';
import { GetIngredientsScope, type Ingredient } from '@/src/api/generated/model';
import { Screen, screenContentStyles } from '@/src/components/Screen';
import { setCreatedIngredientHandoff } from '@/src/ingredients/createIngredientHandoff';
import { CreateRecipeIngredientPicker } from '@/src/recipes/CreateRecipeIngredientPicker';
import { createIngredientRowId } from '@/src/recipes/createRecipeForm';

const normalizeParam = (value: string | string[] | undefined) => {
    return Array.isArray(value) ? value[0] ?? '' : value ?? '';
};

const CreateRecipeIngredientPickerScreen = () => {
    const params = useLocalSearchParams<{
        rowId?: string | string[];
    }>();
    const [rowId] = useState(
        () => normalizeParam(params.rowId) || createIngredientRowId(),
    );
    const [searchText, setSearchText] = useState('');
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchQuery = searchText.trim();
    const shouldSearchIngredients = searchQuery.length > 0;
    const ingredientsQuery = useGetIngredients(
        {
            query: searchQuery,
            scope: GetIngredientsScope.all,
        },
        {
            query: {
                enabled: shouldSearchIngredients,
            },
        },
    );

    const handleSelect = (ingredient: Ingredient) => {
        setCreatedIngredientHandoff(queryClient, { ingredient, rowId });
        router.back();
    };

    const handleCreateIngredient = () => {
        router.push({
            pathname: '/recipes/ingredient-create',
            params: { name: searchQuery, rowId },
        });
    };

    const handleScan = () => {
        router.push({
            pathname: '/recipes/ingredient-scan',
            params: { rowId },
        });
    };

    return (
        <Screen
            contentStyle={screenContentStyles.plain}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <CreateRecipeIngredientPicker
                isError={ingredientsQuery.isError}
                isSearching={ingredientsQuery.isLoading}
                searchText={searchText}
                searchedIngredients={ingredientsQuery.data?.ingredients ?? []}
                shouldShowResults={shouldSearchIngredients}
                onClose={router.back}
                onCreateIngredient={handleCreateIngredient}
                onScan={handleScan}
                onSearchChange={setSearchText}
                onSelect={handleSelect}
            />
        </Screen>
    );
};

export default CreateRecipeIngredientPickerScreen;
