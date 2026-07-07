import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import IngredientDetailScreen from '@/app/(tabs)/ingredients/[ingredientId]';
import type { Ingredient } from '@/src/api/generated/model';
import { IngredientBaseUnit } from '@/src/api/generated/model';
import {
    getGetIngredientQueryKey,
    getGetIngredientsQueryKey,
    useArchiveIngredient,
    useGetIngredient,
} from '@/src/api/generated/ingredients/ingredients';

const mockReplace = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockRemoveQueries = jest.fn();

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({
        ingredientId: 'ingredient-1',
    }),
    useRouter: () => ({
        replace: mockReplace,
    }),
}));

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
        removeQueries: mockRemoveQueries,
    }),
}));

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => () => null);

jest.mock('@/src/api/generated/ingredients/ingredients', () => ({
    getGetIngredientQueryKey: jest.fn((ingredientId: string) => [
        `/v1/ingredients/${ingredientId}`,
    ]),
    getGetIngredientsQueryKey: jest.fn(() => ['/v1/ingredients']),
    useArchiveIngredient: jest.fn(),
    useGetIngredient: jest.fn(),
}));

const mockedUseGetIngredient = jest.mocked(useGetIngredient);
const mockedUseArchiveIngredient = jest.mocked(useArchiveIngredient);
const mockedGetGetIngredientQueryKey = jest.mocked(getGetIngredientQueryKey);
const mockedGetGetIngredientsQueryKey = jest.mocked(getGetIngredientsQueryKey);
const mockArchiveIngredientMutateAsync = jest.fn<
    (_variables: { ingredientId: string }) => Promise<unknown>
>();

const ingredient: Ingredient = {
    archivedAt: null,
    barcode: '123456',
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
    servingGrams: 150,
    servingLabel: '1 kus',
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

const mockArchiveIngredientMutation = (
    overrides: Partial<ReturnType<typeof useArchiveIngredient>> = {},
) => {
    mockArchiveIngredientMutateAsync.mockResolvedValue({
        ingredient,
    });
    mockedUseArchiveIngredient.mockReturnValue({
        isPending: false,
        mutateAsync: mockArchiveIngredientMutateAsync,
        ...overrides,
    } as unknown as ReturnType<typeof useArchiveIngredient>);
};

describe('IngredientDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        mockIngredientQuery();
        mockArchiveIngredientMutation();
    });

    it('loads the ingredient detail by route id', async () => {
        mockIngredientQuery({ isLoading: true });

        await render(<IngredientDetailScreen />);

        expect(mockedUseGetIngredient).toHaveBeenCalledWith('ingredient-1');
        expect(
            screen.getByTestId('ingredient-detail-loading-indicator'),
        ).toBeOnTheScreen();
        expect(
            screen.getByText('Načítám detail ingredience...'),
        ).toBeOnTheScreen();
    });

    it('shows an error state when the ingredient cannot be loaded', async () => {
        mockIngredientQuery({ isError: true });

        await render(<IngredientDetailScreen />);

        expect(
            screen.getByText('Ingredience se nepovedlo načíst.'),
        ).toBeOnTheScreen();
    });

    it('shows ingredient metadata, macros and serving', async () => {
        mockIngredientQuery({ data: { ingredient } });

        await render(<IngredientDetailScreen />);

        expect(screen.getByText('Rajčata')).toBeOnTheScreen();
        expect(screen.getByText('Bio farma')).toBeOnTheScreen();
        expect(screen.getByText('Základní jednotka: g')).toBeOnTheScreen();
        expect(screen.getByText('Kód: 123456')).toBeOnTheScreen();
        expect(screen.getByText('Nutriční hodnoty na 100 g')).toBeOnTheScreen();
        expect(screen.getByText('18')).toBeOnTheScreen();
        expect(screen.getByText('0.9g')).toBeOnTheScreen();
        expect(screen.getByText('4g')).toBeOnTheScreen();
        expect(screen.getByText('0.2g')).toBeOnTheScreen();
        expect(screen.getByText('1 kus: 150 g')).toBeOnTheScreen();
    });

    it('shows a serving fallback', async () => {
        mockIngredientQuery({
            data: {
                ingredient: {
                    ...ingredient,
                    servingGrams: null,
                    servingLabel: null,
                },
            },
        });

        await render(<IngredientDetailScreen />);

        expect(screen.getByText('Porce zatím není vyplněná.')).toBeOnTheScreen();
    });

    it('opens ingredient actions from the floating action button', async () => {
        const user = userEvent.setup();
        mockIngredientQuery({ data: { ingredient } });

        await render(<IngredientDetailScreen />);
        await user.press(
            screen.getByRole('button', { name: 'Akce ingredience' }),
        );

        expect(
            screen.getByRole('button', { name: /Upravit ingredienci/ }),
        ).toBeDisabled();
        expect(screen.getByText('Připravujeme')).toBeOnTheScreen();
        expect(
            screen.getByRole('button', { name: /Smazat ingredienci/ }),
        ).toBeOnTheScreen();
    });

    it('opens a confirmation alert before deleting the ingredient', async () => {
        const user = userEvent.setup();
        mockIngredientQuery({ data: { ingredient } });

        await render(<IngredientDetailScreen />);
        await user.press(
            screen.getByRole('button', { name: 'Akce ingredience' }),
        );
        await user.press(
            screen.getByRole('button', { name: /Smazat ingredienci/ }),
        );

        expect(Alert.alert).toHaveBeenCalledWith(
            'Smazat ingredienci?',
            'Tahle akce nejde vrátit zpět.',
            expect.arrayContaining([
                expect.objectContaining({
                    style: 'cancel',
                    text: 'Zrušit',
                }),
                expect.objectContaining({
                    style: 'destructive',
                    text: 'Smazat',
                }),
            ]),
        );
        expect(mockArchiveIngredientMutateAsync).not.toHaveBeenCalled();
    });

    it('deletes the ingredient after confirmation and returns to ingredients', async () => {
        const user = userEvent.setup();
        mockIngredientQuery({ data: { ingredient } });

        await render(<IngredientDetailScreen />);
        await user.press(
            screen.getByRole('button', { name: 'Akce ingredience' }),
        );
        await user.press(
            screen.getByRole('button', { name: /Smazat ingredienci/ }),
        );

        const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
            onPress?: () => void;
            text: string;
        }[];
        alertButtons.find((button) => button.text === 'Smazat')?.onPress?.();

        await waitFor(() => {
            expect(mockArchiveIngredientMutateAsync).toHaveBeenCalledWith({
                ingredientId: 'ingredient-1',
            });
        });
        expect(mockedGetGetIngredientsQueryKey).toHaveBeenCalledWith();
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/ingredients'],
        });
        expect(mockedGetGetIngredientQueryKey).toHaveBeenCalledWith(
            'ingredient-1',
        );
        expect(mockRemoveQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/ingredients/ingredient-1'],
        });
        expect(mockReplace).toHaveBeenCalledWith('/ingredients');
    });

    it('shows an error alert when ingredient delete fails', async () => {
        const user = userEvent.setup();
        mockIngredientQuery({ data: { ingredient } });
        mockArchiveIngredientMutateAsync.mockRejectedValue(
            new Error('Delete failed'),
        );

        await render(<IngredientDetailScreen />);
        await user.press(
            screen.getByRole('button', { name: 'Akce ingredience' }),
        );
        await user.press(
            screen.getByRole('button', { name: /Smazat ingredienci/ }),
        );

        const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
            onPress?: () => void;
            text: string;
        }[];
        alertButtons.find((button) => button.text === 'Smazat')?.onPress?.();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Ingredienci se nepovedlo smazat.',
            );
        });
        expect(mockReplace).not.toHaveBeenCalled();
    });
});
