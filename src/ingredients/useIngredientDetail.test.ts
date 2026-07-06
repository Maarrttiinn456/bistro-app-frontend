import { describe, expect, it } from '@jest/globals';

import type { Ingredient } from '@/src/api/generated/model';
import { IngredientBaseUnit } from '@/src/api/generated/model';

import { selectIngredientById } from './useIngredientDetail';

const tomato: Ingredient = {
    archivedAt: null,
    barcode: null,
    baseUnit: IngredientBaseUnit.g,
    brand: null,
    carbsPer100: 4,
    createdAt: '2026-07-01T10:00:00.000Z',
    fatPer100: 0.2,
    householdId: null,
    id: 'ingredient-1',
    kcalPer100: 18,
    name: 'Tomato',
    proteinPer100: 0.9,
    servingGrams: null,
    servingLabel: null,
};

const rice: Ingredient = {
    ...tomato,
    id: 'ingredient-2',
    name: 'Rice',
};

describe('useIngredientDetail', () => {
    it('selects an ingredient by id from the current list response', () => {
        expect(selectIngredientById([tomato, rice], 'ingredient-2')).toBe(
            rice,
        );
    });

    it('returns undefined when the list or ingredient is missing', () => {
        expect(selectIngredientById(undefined, 'ingredient-1')).toBeUndefined();
        expect(selectIngredientById([tomato], 'missing')).toBeUndefined();
    });
});
