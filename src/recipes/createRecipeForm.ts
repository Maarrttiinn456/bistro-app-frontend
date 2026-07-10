import {
    MealSlot,
    type CreateRecipeBody,
    type Ingredient,
    type RecipeIngredientInput,
} from '@/src/api/generated/model';
import { formatMacroValue } from '@/src/recipes/recipeFormatters';

export type IngredientMode = 'catalog' | 'freeText';

export type RecipeIngredientRow = {
    id: string;
    mode: IngredientMode;
    searchText: string;
    displayName: string;
    ingredientId: string | null;
    selectedIngredient: Ingredient | null;
    amountG: string;
    displayAmount: string;
    displayUnit: string;
    showDisplayAmount: boolean;
};

export type MacroTotals = {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type CreateRecipeDraft = {
    name: string;
    image: string;
    prepTimeMin: string;
    portions: string;
    mealTypes: MealSlot[];
    steps: string;
    sourceUrl: string;
    ingredientRows: RecipeIngredientRow[];
};

type BuildRecipeBodyResult =
    | {
          body: CreateRecipeBody;
          error: null;
      }
    | {
          body: null;
          error: string;
      };

export const mealTypeOptions: { value: MealSlot; label: string }[] = [
    { value: MealSlot.breakfast, label: 'Snídaně' },
    { value: MealSlot.lunch, label: 'Oběd' },
    { value: MealSlot.dinner, label: 'Večeře' },
    { value: MealSlot.snack, label: 'Svačina' },
];

export const createIngredientRowId = () => `${Date.now()}-${Math.random()}`;

export const createEmptyIngredientRow = (): RecipeIngredientRow => ({
    amountG: '',
    displayAmount: '',
    displayName: '',
    displayUnit: '',
    id: createIngredientRowId(),
    ingredientId: null,
    mode: 'catalog',
    searchText: '',
    selectedIngredient: null,
    showDisplayAmount: false,
});

export const createSelectedIngredientRow = (
    ingredient: Ingredient,
    rowId = createIngredientRowId(),
): RecipeIngredientRow => ({
    ...createEmptyIngredientRow(),
    displayName: ingredient.name,
    id: rowId,
    ingredientId: ingredient.id,
    searchText: ingredient.name,
    selectedIngredient: ingredient,
});

export const parseFormNumber = (value: string) => {
    const normalizedValue = value.replace(',', '.').trim();

    if (normalizedValue.length === 0) {
        return null;
    }

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const toOptionalText = (value: string) => {
    const trimmedValue = value.trim();

    return trimmedValue.length === 0 ? null : trimmedValue;
};

export const formatIngredientMacros = (ingredient: Ingredient) => {
    return `100 ${ingredient.baseUnit}: ${formatMacroValue(
        ingredient.kcalPer100,
    )} kcal · B ${formatMacroValue(
        ingredient.proteinPer100,
    )}g · S ${formatMacroValue(ingredient.carbsPer100)}g · T ${formatMacroValue(
        ingredient.fatPer100,
    )}g`;
};

export const calculateMacroTotals = (
    ingredientRows: RecipeIngredientRow[],
): MacroTotals => {
    return ingredientRows.reduce<MacroTotals>(
        (totals, ingredientRow) => {
            const amountG = parseFormNumber(ingredientRow.amountG);
            const ingredient = ingredientRow.selectedIngredient;

            if (
                ingredientRow.mode !== 'catalog' ||
                ingredient === null ||
                amountG === null ||
                amountG < 0
            ) {
                return totals;
            }

            const ratio = amountG / 100;

            return {
                carbs: totals.carbs + ingredient.carbsPer100 * ratio,
                fat: totals.fat + ingredient.fatPer100 * ratio,
                kcal: totals.kcal + ingredient.kcalPer100 * ratio,
                protein: totals.protein + ingredient.proteinPer100 * ratio,
            };
        },
        { carbs: 0, fat: 0, kcal: 0, protein: 0 },
    );
};

const buildRecipeIngredients = (
    ingredientRows: RecipeIngredientRow[],
):
    | {
          error: null;
          ingredients: RecipeIngredientInput[];
      }
    | {
          error: string;
          ingredients: null;
      } => {
    const ingredients: RecipeIngredientInput[] = [];

    for (const [index, ingredientRow] of ingredientRows.entries()) {
        const amountG = parseFormNumber(ingredientRow.amountG);
        const displayAmount = parseFormNumber(ingredientRow.displayAmount);
        const displayName = ingredientRow.displayName.trim();

        if (
            ingredientRow.mode === 'catalog' &&
            ingredientRow.ingredientId === null
        ) {
            return {
                error: 'Vyber surovinu z katalogu, nebo přepni na volnou surovinu bez maker.',
                ingredients: null,
            };
        }

        if (displayName.length === 0) {
            return {
                error: 'Každá surovina musí mít název.',
                ingredients: null,
            };
        }

        if (amountG === null || amountG < 0) {
            return {
                error: 'Každá surovina musí mít gramáž alespoň 0 g.',
                ingredients: null,
            };
        }

        if (
            ingredientRow.displayAmount.trim().length > 0 &&
            displayAmount === null
        ) {
            return {
                error: 'Zobrazovací množství musí být číslo.',
                ingredients: null,
            };
        }

        ingredients.push({
            amountG,
            displayAmount,
            displayName,
            displayUnit: toOptionalText(ingredientRow.displayUnit),
            ingredientId:
                ingredientRow.mode === 'freeText'
                    ? null
                    : ingredientRow.ingredientId,
            position: index,
        });
    }

    return { error: null, ingredients };
};

export const buildCreateRecipeBody = (
    draft: CreateRecipeDraft,
): BuildRecipeBodyResult => {
    const trimmedName = draft.name.trim();
    const parsedPortions = parseFormNumber(draft.portions);
    const parsedPrepTimeMin = parseFormNumber(draft.prepTimeMin);

    if (trimmedName.length === 0) {
        return { body: null, error: 'Vyplň název receptu.' };
    }

    if (parsedPortions === null || parsedPortions < 1) {
        return { body: null, error: 'Porce musí být alespoň 1.' };
    }

    if (
        draft.prepTimeMin.trim().length > 0 &&
        (parsedPrepTimeMin === null || parsedPrepTimeMin < 0)
    ) {
        return {
            body: null,
            error: 'Čas přípravy musí být nezáporné číslo.',
        };
    }

    if (draft.mealTypes.length === 0) {
        return { body: null, error: 'Vyber alespoň jeden typ jídla.' };
    }

    if (draft.ingredientRows.length === 0) {
        return { body: null, error: 'Přidej alespoň jednu surovinu.' };
    }

    const recipeIngredientsResult = buildRecipeIngredients(
        draft.ingredientRows,
    );

    if (recipeIngredientsResult.error !== null) {
        return { body: null, error: recipeIngredientsResult.error };
    }

    return {
        body: {
            image: toOptionalText(draft.image),
            ingredients: recipeIngredientsResult.ingredients,
            mealTypes: draft.mealTypes,
            name: trimmedName,
            portions: parsedPortions,
            sourceUrl: toOptionalText(draft.sourceUrl),
            ...(parsedPrepTimeMin === null
                ? {}
                : { prepTimeMin: parsedPrepTimeMin }),
            ...(draft.steps.trim().length === 0
                ? {}
                : { steps: draft.steps.trim() }),
        },
        error: null,
    };
};
