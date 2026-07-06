import {
    GetIngredientsScope,
    type Ingredient,
} from '@/src/api/generated/model';
import { useGetIngredients } from '@/src/api/generated/ingredients/ingredients';

export const selectIngredientById = (
    ingredients: Ingredient[] | undefined,
    ingredientId: string,
) => {
    return ingredients?.find((ingredient) => ingredient.id === ingredientId);
};

export const useIngredientDetail = (ingredientId: string) => {
    const ingredientsQuery = useGetIngredients({
        scope: GetIngredientsScope.all,
    });
    const ingredient = selectIngredientById(
        ingredientsQuery.data?.ingredients,
        ingredientId,
    );

    return {
        ...ingredientsQuery,
        ingredient,
    };
};
