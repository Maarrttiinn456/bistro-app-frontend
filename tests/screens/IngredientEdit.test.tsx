import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import IngredientEdit from '@/app/(tabs)/ingredients/[ingredientId]/edit';
import {
    getGetIngredientQueryKey,
    getGetIngredientsQueryKey,
    useGetIngredient,
    useUpdateIngredient,
} from '@/src/api/generated/ingredients/ingredients';
import type {
    Ingredient,
    IngredientResponse,
    UpdateIngredientBody,
} from '@/src/api/generated/model';
import {
    IngredientBaseUnit,
    UpdateIngredientBodyBaseUnit,
} from '@/src/api/generated/model';

const mockBack = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({
        ingredientId: 'ingredient-1',
    }),
    useRouter: () => ({
        back: mockBack,
    }),
}));

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}));

jest.mock('@/src/api/generated/ingredients/ingredients', () => ({
    getGetIngredientQueryKey: jest.fn((ingredientId: string) => [
        `/v1/ingredients/${ingredientId}`,
    ]),
    getGetIngredientsQueryKey: jest.fn(() => ['/v1/ingredients']),
    useGetIngredient: jest.fn(),
    useUpdateIngredient: jest.fn(),
}));

const mockedUseGetIngredient = jest.mocked(useGetIngredient);
const mockedUseUpdateIngredient = jest.mocked(useUpdateIngredient);
const mockedGetGetIngredientQueryKey = jest.mocked(getGetIngredientQueryKey);
const mockedGetGetIngredientsQueryKey = jest.mocked(getGetIngredientsQueryKey);
const updateIngredientMutateAsync = jest.fn<
    (_variables: {
        ingredientId: string;
        data: UpdateIngredientBody;
    }) => Promise<IngredientResponse>
>();

const ingredient: Ingredient = {
    archivedAt: null,
    barcode: '123456',
    baseUnit: IngredientBaseUnit.g,
    brand: 'Bio farma',
    carbsPer100: 4,
    createdAt: '2026-06-30T10:00:00.000Z',
    fatPer100: 0.2,
    householdId: 'household-1',
    id: 'ingredient-1',
    kcalPer100: 18,
    name: 'Rajcata',
    proteinPer100: 0.9,
    servingGrams: null,
    servingLabel: null,
};

const mockIngredientQuery = (
    overrides: Partial<ReturnType<typeof useGetIngredient>> = {},
) => {
    mockedUseGetIngredient.mockReturnValue({
        data: { ingredient },
        isError: false,
        isLoading: false,
        ...overrides,
    } as ReturnType<typeof useGetIngredient>);
};

const mockUpdateIngredientMutation = (
    overrides: Partial<ReturnType<typeof useUpdateIngredient>> = {},
) => {
    updateIngredientMutateAsync.mockResolvedValue({
        ingredient: {
            ...ingredient,
            name: 'Cherry rajcata',
        },
    });
    mockedUseUpdateIngredient.mockReturnValue({
        isPending: false,
        mutateAsync: updateIngredientMutateAsync,
        ...overrides,
    } as unknown as ReturnType<typeof useUpdateIngredient>);
};

describe('IngredientEdit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIngredientQuery();
        mockUpdateIngredientMutation();
    });

    it('loads the ingredient by route id', async () => {
        mockIngredientQuery({ isLoading: true });

        await render(<IngredientEdit />);

        expect(mockedUseGetIngredient).toHaveBeenCalledWith('ingredient-1');
        expect(
            screen.getByTestId('ingredient-edit-loading-indicator'),
        ).toBeOnTheScreen();
    });

    it('prefills the ingredient form', async () => {
        await render(<IngredientEdit />);

        expect(screen.getByDisplayValue('Rajcata')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('Bio farma')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('123456')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('18')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('0.9')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('4')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('0.2')).toBeOnTheScreen();
    });

    it('validates required macros before submit', async () => {
        const user = userEvent.setup();

        await render(<IngredientEdit />);
        await user.clear(screen.getByLabelText('Kalorie na 100 g'));
        await user.press(screen.getByRole('button', { name: 'Uložit změny' }));

        expect(
            screen.getByText('Vyplň nezáporná makra na 100 g/ml.'),
        ).toBeOnTheScreen();
        expect(updateIngredientMutateAsync).not.toHaveBeenCalled();
    });

    it('updates the ingredient, invalidates queries and closes the modal', async () => {
        const user = userEvent.setup();

        await render(<IngredientEdit />);
        await user.clear(screen.getByLabelText('Název upravované suroviny'));
        await user.type(
            screen.getByLabelText('Název upravované suroviny'),
            ' Cherry rajcata ',
        );
        await user.clear(screen.getByLabelText('Čárový kód upravované suroviny'));
        await user.type(
            screen.getByLabelText('Čárový kód upravované suroviny'),
            ' 987654 ',
        );
        await user.press(screen.getByRole('button', { name: 'ml' }));
        await user.press(screen.getByRole('button', { name: 'Uložit změny' }));

        await waitFor(() =>
            expect(updateIngredientMutateAsync).toHaveBeenCalledWith({
                data: {
                    baseUnit: UpdateIngredientBodyBaseUnit.ml,
                    barcode: '987654',
                    brand: 'Bio farma',
                    carbsPer100: 4,
                    fatPer100: 0.2,
                    kcalPer100: 18,
                    name: 'Cherry rajcata',
                    proteinPer100: 0.9,
                },
                ingredientId: 'ingredient-1',
            }),
        );
        expect(mockedGetGetIngredientsQueryKey).toHaveBeenCalledWith();
        expect(mockedGetGetIngredientQueryKey).toHaveBeenCalledWith(
            'ingredient-1',
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/ingredients'],
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/ingredients/ingredient-1'],
        });
        expect(mockBack).toHaveBeenCalled();
    });

    it('shows the backend error when update fails', async () => {
        const user = userEvent.setup();
        updateIngredientMutateAsync.mockRejectedValueOnce({
            response: {
                data: { error: 'Ingredient not found' },
                status: 404,
            },
        });

        await render(<IngredientEdit />);
        await user.press(screen.getByRole('button', { name: 'Uložit změny' }));

        expect(
            await screen.findByText('Ingredient not found (HTTP 404)'),
        ).toBeOnTheScreen();
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
        expect(mockBack).not.toHaveBeenCalled();
    });
});
