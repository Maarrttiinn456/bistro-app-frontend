import type { QueryClient } from '@tanstack/react-query';

import type { Ingredient } from '@/src/api/generated/model';

export type CreatedIngredientHandoff = {
    rowId: string;
    ingredient: Ingredient;
};

const createdIngredientHandoffQueryKey = [
    'recipes',
    'created-ingredient-handoff',
] as const;

export const setCreatedIngredientHandoff = (
    queryClient: QueryClient,
    handoff: CreatedIngredientHandoff,
) => {
    queryClient.setQueryData<CreatedIngredientHandoff | null>(
        createdIngredientHandoffQueryKey,
        handoff,
    );
};

export const consumeCreatedIngredientHandoff = (
    queryClient: QueryClient,
): CreatedIngredientHandoff | null => {
    const handoff = queryClient.getQueryData<CreatedIngredientHandoff | null>(
        createdIngredientHandoffQueryKey,
    );

    if (handoff === undefined || handoff === null) {
        return null;
    }

    queryClient.setQueryData<CreatedIngredientHandoff | null>(
        createdIngredientHandoffQueryKey,
        null,
    );

    return handoff;
};
