import { useMutation } from '@tanstack/react-query';

import { customInstance } from '@/src/api/mutator';

export const deleteIngredient = (
    ingredientId: string,
    signal?: AbortSignal,
) => {
    return customInstance<void>({
        method: 'DELETE',
        signal,
        url: `/v1/ingredients/${ingredientId}`,
    });
};

export const getDeleteIngredientMutationKey = () => ['deleteIngredient'];

export const useDeleteIngredient = () => {
    return useMutation({
        mutationFn: ({ ingredientId }: { ingredientId: string }) =>
            deleteIngredient(ingredientId),
        mutationKey: getDeleteIngredientMutationKey(),
    });
};
