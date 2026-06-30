import {
    MealSlot,
    type RecipeDetail,
    type RecipeIngredient,
} from '@/src/api/generated/model';

const mealSlotLabels: Record<MealSlot, string> = {
    [MealSlot.breakfast]: 'Snídaně',
    [MealSlot.lunch]: 'Oběd',
    [MealSlot.dinner]: 'Večeře',
    [MealSlot.snack]: 'Svačina',
};

export const formatMealTypes = (mealTypes: RecipeDetail['mealTypes']) => {
    return mealTypes.map((mealType) => mealSlotLabels[mealType]).join(', ');
};

export const formatIngredientAmount = (ingredient: RecipeIngredient) => {
    if (
        ingredient.displayAmount !== null &&
        ingredient.displayAmount !== undefined &&
        ingredient.displayUnit
    ) {
        return `${ingredient.displayAmount} ${ingredient.displayUnit}`;
    }

    return `${ingredient.amountG} g`;
};

export const formatMacroValue = (value: number) => {
    return Number(value.toFixed(1)).toString();
};
