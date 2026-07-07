import type { Ingredient } from '@/src/api/generated/model';

export type IngredientMacroKey =
    | 'kcalPer100'
    | 'proteinPer100'
    | 'carbsPer100'
    | 'fatPer100';

export const ingredientMacroItems: {
    key: IngredientMacroKey;
    label: string;
    unit: string;
}[] = [
    { key: 'kcalPer100', label: 'kcal', unit: '' },
    { key: 'proteinPer100', label: 'Bílkoviny', unit: 'g' },
    { key: 'carbsPer100', label: 'Sacharidy', unit: 'g' },
    { key: 'fatPer100', label: 'Tuky', unit: 'g' },
];

export const formatIngredientNumber = (value: number) => {
    return Number(value.toFixed(1)).toString();
};

export const formatIngredientMacroValue = (
    ingredient: Ingredient,
    key: IngredientMacroKey,
) => {
    return formatIngredientNumber(ingredient[key]);
};

export const formatIngredientNutritionPer100 = (ingredient: Ingredient) => {
    const separator = ' \u00b7 ';

    return [
        `Na 100 ${ingredient.baseUnit}: ${formatIngredientNumber(
            ingredient.kcalPer100,
        )} kcal`,
        `B ${formatIngredientNumber(ingredient.proteinPer100)}g`,
        `S ${formatIngredientNumber(ingredient.carbsPer100)}g`,
        `T ${formatIngredientNumber(ingredient.fatPer100)}g`,
    ].join(separator);
};
