import { useGetIngredient } from '@/src/api/generated/ingredients/ingredients';

export const useIngredientDetail = (ingredientId: string) => {
    const ingredientQuery = useGetIngredient(ingredientId);

    return {
        ...ingredientQuery,
        ingredient: ingredientQuery.data?.ingredient,
    };
};
