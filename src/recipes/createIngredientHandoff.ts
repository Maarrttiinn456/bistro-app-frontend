import type { Ingredient } from '@/src/api/generated/model';

export type CreatedIngredientHandoff = {
    rowId: string;
    ingredient: Ingredient;
};

export const createdIngredientHandoffQueryKey = [
    'recipes',
    'created-ingredient-handoff',
] as const;
