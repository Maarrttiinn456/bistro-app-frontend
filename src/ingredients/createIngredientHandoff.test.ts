import { describe, expect, it, jest } from '@jest/globals';
import type { QueryClient } from '@tanstack/react-query';

import { IngredientBaseUnit, type Ingredient } from '@/src/api/generated/model';

import {
    consumeCreatedIngredientHandoff,
    setCreatedIngredientHandoff,
} from './createIngredientHandoff';

const ingredient: Ingredient = {
    archivedAt: null,
    barcode: null,
    baseUnit: IngredientBaseUnit.g,
    brand: null,
    carbsPer100: 12,
    createdAt: '2026-07-01T10:00:00.000Z',
    fatPer100: 3,
    householdId: 'household-1',
    id: 'ingredient-1',
    kcalPer100: 80,
    name: 'Tempeh',
    proteinPer100: 15,
    servingGrams: null,
    servingLabel: null,
};

const createQueryClient = () => {
    let queryData: unknown;

    return {
        getQueryData: jest.fn(() => queryData),
        setQueryData: jest.fn((_queryKey: unknown, nextQueryData: unknown) => {
            queryData = nextQueryData;
            return queryData;
        }),
    } as unknown as QueryClient;
};

describe('createIngredientHandoff', () => {
    it('stores and consumes a created ingredient handoff once', () => {
        const queryClient = createQueryClient();
        const handoff = {
            ingredient,
            rowId: 'row-1',
        };

        setCreatedIngredientHandoff(queryClient, handoff);

        expect(consumeCreatedIngredientHandoff(queryClient)).toEqual(handoff);
        expect(consumeCreatedIngredientHandoff(queryClient)).toBeNull();
    });

    it('returns null when there is no handoff', () => {
        const queryClient = createQueryClient();

        expect(consumeCreatedIngredientHandoff(queryClient)).toBeNull();
    });
});
