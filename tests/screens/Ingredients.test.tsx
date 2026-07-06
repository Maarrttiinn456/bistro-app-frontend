import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent } from '@testing-library/react-native';

import Ingredients from '@/app/(tabs)/ingredients';
import type { Ingredient } from '@/src/api/generated/model';
import {
    GetIngredientsScope,
    IngredientBaseUnit,
} from '@/src/api/generated/model';
import { useGetIngredients } from '@/src/api/generated/ingredients/ingredients';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => () => null);

jest.mock('@/src/api/generated/ingredients/ingredients', () => ({
    useGetIngredients: jest.fn(),
}));

const mockedUseGetIngredients = jest.mocked(useGetIngredients);

const ingredient: Ingredient = {
    barcode: null,
    baseUnit: IngredientBaseUnit.g,
    brand: 'Bio farma',
    carbsPer100: 4,
    createdAt: '2026-06-30T10:00:00.000Z',
    fatPer100: 0.2,
    householdId: null,
    id: 'ingredient-1',
    kcalPer100: 18,
    name: 'Rajčata',
    proteinPer100: 0.9,
    servingGrams: null,
    servingLabel: null,
};

const mockIngredientsQuery = (
    overrides: Partial<ReturnType<typeof useGetIngredients>> = {},
) => {
    mockedUseGetIngredients.mockReturnValue({
        data: undefined,
        isError: false,
        isLoading: false,
        ...overrides,
    } as ReturnType<typeof useGetIngredients>);
};

describe('Ingredients', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIngredientsQuery();
    });

    it('loads all ingredients', async () => {
        mockIngredientsQuery({ isLoading: true });

        await render(<Ingredients />);

        expect(mockedUseGetIngredients).toHaveBeenCalledWith({
            scope: GetIngredientsScope.all,
        });
        expect(
            screen.getByTestId('ingredients-loading-indicator'),
        ).toBeOnTheScreen();
        expect(
            screen.getByText('Načítám ingredience...'),
        ).toBeOnTheScreen();
    });

    it('shows an error state when ingredients cannot be loaded', async () => {
        mockIngredientsQuery({ isError: true });

        await render(<Ingredients />);

        expect(
            screen.getByText('Ingredience se nepovedlo načíst.'),
        ).toBeOnTheScreen();
    });

    it('shows an empty state when there are no ingredients', async () => {
        mockIngredientsQuery({ data: { ingredients: [] } });

        await render(<Ingredients />);

        expect(
            screen.getByText('Zatím nejsou žádné ingredience.'),
        ).toBeOnTheScreen();
    });

    it('shows ingredient details from the ingredients response', async () => {
        mockIngredientsQuery({ data: { ingredients: [ingredient] } });

        await render(<Ingredients />);

        expect(screen.getByText('Rajčata')).toBeOnTheScreen();
        expect(screen.getByText('Bio farma')).toBeOnTheScreen();
        expect(screen.getByText('Jednotka: g')).toBeOnTheScreen();
        expect(
            screen.getByText('Na 100 g: 18 kcal · B 0.9g · S 4g · T 0.2g'),
        ).toBeOnTheScreen();
    });

    it('opens ingredient detail from the list', async () => {
        const user = userEvent.setup();
        mockIngredientsQuery({ data: { ingredients: [ingredient] } });

        await render(<Ingredients />);
        await user.press(
            screen.getByRole('button', {
                name: 'Otevřít ingredienci Rajčata',
            }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/ingredients/[ingredientId]',
            params: { ingredientId: 'ingredient-1' },
        });
    });

    it('opens manual ingredient creation from the floating action button', async () => {
        const user = userEvent.setup();
        mockIngredientsQuery({ data: { ingredients: [ingredient] } });

        await render(<Ingredients />);
        await user.press(
            screen.getByRole('button', { name: 'Přidat ingredienci' }),
        );
        const scanCodeButton = screen.getByRole('button', {
            name: /Naskenovat kód/,
        });

        expect(scanCodeButton).toBeDisabled();
        expect(screen.getByText('Připravujeme')).toBeOnTheScreen();
        await user.press(
            screen.getByRole('button', { name: /Přidat ručně/ }),
        );

        expect(mockPush).toHaveBeenCalledWith('/ingredients/create');
    });
});
