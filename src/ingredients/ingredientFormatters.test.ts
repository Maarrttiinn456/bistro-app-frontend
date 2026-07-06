import { describe, expect, it } from '@jest/globals';

import type { Ingredient } from '@/src/api/generated/model';
import { IngredientBaseUnit } from '@/src/api/generated/model';

import {
    formatIngredientMacroValue,
    formatIngredientNutritionPer100,
    formatIngredientNumber,
} from './ingredientFormatters';

const ingredient: Ingredient = {
    archivedAt: null,
    barcode: null,
    baseUnit: IngredientBaseUnit.g,
    brand: null,
    carbsPer100: 4,
    createdAt: '2026-07-01T10:00:00.000Z',
    fatPer100: 0.24,
    householdId: null,
    id: 'ingredient-1',
    kcalPer100: 18,
    name: 'Rajčata',
    proteinPer100: 0.86,
    servingGrams: null,
    servingLabel: null,
};

describe('ingredientFormatters', () => {
    it('formats numbers with at most one decimal place', () => {
        expect(formatIngredientNumber(18)).toBe('18');
        expect(formatIngredientNumber(0.86)).toBe('0.9');
        expect(formatIngredientNumber(0.24)).toBe('0.2');
    });

    it('formats a macro value by key', () => {
        expect(formatIngredientMacroValue(ingredient, 'proteinPer100')).toBe(
            '0.9',
        );
    });

    it('formats nutrition values per 100 base units', () => {
        expect(formatIngredientNutritionPer100(ingredient)).toBe(
            'Na 100 g: 18 kcal \u00b7 B 0.9g \u00b7 S 4g \u00b7 T 0.2g',
        );
    });
});
