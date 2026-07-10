import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import CreateIngredient from '@/app/(tabs)/ingredients/create';
import type {
    CreateIngredientBody,
    Ingredient,
    IngredientResponse,
} from '@/src/api/generated/model';
import {
    CreateIngredientBodyBaseUnit,
    IngredientBaseUnit,
} from '@/src/api/generated/model';
import { useCreateIngredient } from '@/src/api/generated/ingredients/ingredients';

const mockBack = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockSetQueryData = jest.fn();
let mockSearchParams: Record<string, string | undefined> = {};
let mockPathname = '/ingredients/create';

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => mockSearchParams,
    usePathname: () => mockPathname,
    useRouter: () => ({
        back: mockBack,
    }),
}));

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
        setQueryData: mockSetQueryData,
    }),
}));

jest.mock('@/src/api/generated/ingredients/ingredients', () => ({
    getGetIngredientsQueryKey: jest.fn(() => ['/v1/ingredients']),
    useCreateIngredient: jest.fn(),
}));

const mockedUseCreateIngredient = jest.mocked(useCreateIngredient);
const createIngredientMutateAsync = jest.fn<
    (_variables: { data: CreateIngredientBody }) => Promise<IngredientResponse>
>();

const createdIngredient: Ingredient = {
    archivedAt: null,
    barcode: null,
    baseUnit: IngredientBaseUnit.g,
    brand: null,
    carbsPer100: 12,
    createdAt: '2026-07-01T10:00:00.000Z',
    fatPer100: 3,
    householdId: 'household-1',
    id: 'ingredient-2',
    kcalPer100: 80,
    name: 'Tempeh',
    proteinPer100: 15,
    servingGrams: null,
    servingLabel: null,
};

const mockCreateIngredientMutation = () => {
    createIngredientMutateAsync.mockResolvedValue({
        ingredient: createdIngredient,
    });
    mockedUseCreateIngredient.mockReturnValue({
        isPending: false,
        mutateAsync: createIngredientMutateAsync,
    } as unknown as ReturnType<typeof useCreateIngredient>);
};

const fillValidMacrosAndSubmit = async () => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Kalorie na 100 g'), '80');
    await user.type(screen.getByLabelText('Bílkoviny na 100 g'), '15');
    await user.type(screen.getByLabelText('Sacharidy na 100 g'), '12');
    await user.type(screen.getByLabelText('Tuky na 100 g'), '3');
    await user.press(screen.getByRole('button', { name: 'Uložit surovinu' }));
};

describe('CreateIngredient', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams = {
            name: 'Tempeh',
            rowId: 'row-1',
        };
        mockPathname = '/ingredients/create';
        mockCreateIngredientMutation();
    });

    it('prefills the ingredient name from route params', async () => {
        await render(<CreateIngredient />);

        expect(screen.getByDisplayValue('Tempeh')).toBeOnTheScreen();
    });

    it('closes the create ingredient modal', async () => {
        const user = userEvent.setup();

        await render(<CreateIngredient />);
        await user.press(screen.getByRole('button', { name: 'Zavřít' }));

        expect(mockBack).toHaveBeenCalled();
    });

    it('prefills the barcode from route params', async () => {
        mockSearchParams = {
            barcode: '3017620422003',
            name: 'Nutella',
        };

        await render(<CreateIngredient />);

        expect(screen.getByDisplayValue('3017620422003')).toBeOnTheScreen();
    });

    it('validates required macros before submit', async () => {
        const user = userEvent.setup();

        await render(<CreateIngredient />);
        await user.press(screen.getByRole('button', { name: 'Uložit surovinu' }));

        expect(
            screen.getByText('Vyplň nezáporná makra na 100 g/ml.'),
        ).toBeOnTheScreen();
        expect(createIngredientMutateAsync).not.toHaveBeenCalled();
    });

    it('creates the ingredient, stores handoff and goes back', async () => {
        await render(<CreateIngredient />);
        await fillValidMacrosAndSubmit();

        await waitFor(() =>
            expect(createIngredientMutateAsync).toHaveBeenCalledWith({
                data: {
                    baseUnit: CreateIngredientBodyBaseUnit.g,
                    barcode: null,
                    brand: null,
                    carbsPer100: 12,
                    fatPer100: 3,
                    kcalPer100: 80,
                    name: 'Tempeh',
                    proteinPer100: 15,
                },
            }),
        );
        expect(mockSetQueryData).toHaveBeenCalledWith(
            expect.any(Array),
            {
                ingredient: createdIngredient,
                rowId: 'row-1',
            },
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/ingredients'],
        });
        expect(mockBack).toHaveBeenCalled();
    });

    it('creates the ingredient without handoff when opened from ingredients', async () => {
        const user = userEvent.setup();
        mockSearchParams = {};

        await render(<CreateIngredient />);
        await user.type(screen.getByLabelText('Název nové suroviny'), 'Tempeh');
        await user.type(screen.getByLabelText('Kalorie na 100 g'), '80');
        await user.type(screen.getByLabelText('Bílkoviny na 100 g'), '15');
        await user.type(screen.getByLabelText('Sacharidy na 100 g'), '12');
        await user.type(screen.getByLabelText('Tuky na 100 g'), '3');
        await user.press(screen.getByRole('button', { name: 'Uložit surovinu' }));

        await waitFor(() =>
            expect(createIngredientMutateAsync).toHaveBeenCalledWith({
                data: {
                    baseUnit: CreateIngredientBodyBaseUnit.g,
                    barcode: null,
                    brand: null,
                    carbsPer100: 12,
                    fatPer100: 3,
                    kcalPer100: 80,
                    name: 'Tempeh',
                    proteinPer100: 15,
                },
            }),
        );
        expect(mockSetQueryData).not.toHaveBeenCalled();
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/ingredients'],
        });
        expect(mockBack).toHaveBeenCalled();
    });

    it('sends a trimmed barcode when it is filled', async () => {
        mockSearchParams = {
            barcode: ' 3017620422003 ',
            name: 'Nutella',
        };

        await render(<CreateIngredient />);
        await fillValidMacrosAndSubmit();

        await waitFor(() =>
            expect(createIngredientMutateAsync).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    barcode: '3017620422003',
                }),
            }),
        );
    });

    it('shows the backend unauthorized error when create fails', async () => {
        createIngredientMutateAsync.mockRejectedValueOnce({
            response: {
                data: { error: 'Unauthorized' },
                status: 401,
            },
        });

        await render(<CreateIngredient />);
        await fillValidMacrosAndSubmit();

        expect(
            await screen.findByText('Unauthorized (HTTP 401)'),
        ).toBeOnTheScreen();
        expect(mockSetQueryData).not.toHaveBeenCalled();
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
        expect(mockBack).not.toHaveBeenCalled();
    });

    it('shows the backend missing household error when create fails', async () => {
        createIngredientMutateAsync.mockRejectedValueOnce({
            response: {
                data: { error: 'Active household is missing' },
                status: 400,
            },
        });

        await render(<CreateIngredient />);
        await fillValidMacrosAndSubmit();

        expect(
            await screen.findByText('Active household is missing (HTTP 400)'),
        ).toBeOnTheScreen();
        expect(mockSetQueryData).not.toHaveBeenCalled();
        expect(mockInvalidateQueries).not.toHaveBeenCalled();
        expect(mockBack).not.toHaveBeenCalled();
    });
});
