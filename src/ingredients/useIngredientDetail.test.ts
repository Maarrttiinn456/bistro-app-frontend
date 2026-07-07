import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useGetIngredient } from '@/src/api/generated/ingredients/ingredients';
import type { Ingredient } from '@/src/api/generated/model';
import { IngredientBaseUnit } from '@/src/api/generated/model';

import { useIngredientDetail } from './useIngredientDetail';

jest.mock('@/src/api/generated/ingredients/ingredients', () => ({
    useGetIngredient: jest.fn(),
}));

const mockedUseGetIngredient = jest.mocked(useGetIngredient);

const ingredient: Ingredient = {
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

const mockIngredientQuery = (
    overrides: Partial<ReturnType<typeof useGetIngredient>> = {},
) => {
    mockedUseGetIngredient.mockReturnValue({
        data: undefined,
        isError: false,
        isLoading: false,
        ...overrides,
    } as ReturnType<typeof useGetIngredient>);
};

describe('useIngredientDetail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads ingredient detail by id', async () => {
        mockIngredientQuery({ data: { ingredient } });

        const { result } = await renderHook(() =>
            useIngredientDetail('ingredient-1'),
        );

        expect(mockedUseGetIngredient).toHaveBeenCalledWith('ingredient-1');
        expect(result.current.ingredient).toBe(ingredient);
    });

    it('keeps ingredient empty while the detail response is missing', async () => {
        mockIngredientQuery({ isLoading: true });

        const { result } = await renderHook(() =>
            useIngredientDetail('ingredient-1'),
        );

        expect(result.current.ingredient).toBeUndefined();
        expect(result.current.isLoading).toBe(true);
    });
});
