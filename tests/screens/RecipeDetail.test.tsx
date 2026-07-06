import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import RecipeEditScreen from '@/app/(tabs)/recipes/[recipeId]/edit';
import RecipeDetailScreen from '@/app/(tabs)/recipes/[recipeId]';
import type { RecipeDetail } from '@/src/api/generated/model';
import { MealSlot } from '@/src/api/generated/model';
import {
    getGetRecipeQueryKey,
    getGetRecipesQueryKey,
    useDeleteRecipe,
    useGetRecipe,
} from '@/src/api/generated/recipes/recipes';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockRemoveQueries = jest.fn();

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({
        recipeId: 'recipe-1',
    }),
    useRouter: () => ({
        push: mockPush,
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

jest.mock('@/src/api/generated/recipes/recipes', () => ({
    getGetRecipeQueryKey: jest.fn((recipeId: string) => [
        `/v1/recipes/${recipeId}`,
    ]),
    getGetRecipesQueryKey: jest.fn(() => ['/v1/recipes']),
    useDeleteRecipe: jest.fn(),
    useGetRecipe: jest.fn(),
}));

const mockedUseGetRecipe = jest.mocked(useGetRecipe);
const mockedUseDeleteRecipe = jest.mocked(useDeleteRecipe);
const mockedGetGetRecipeQueryKey = jest.mocked(getGetRecipeQueryKey);
const mockedGetGetRecipesQueryKey = jest.mocked(getGetRecipesQueryKey);
const mockDeleteRecipeMutateAsync = jest.fn<
    (_variables: { recipeId: string }) => Promise<{ success: boolean }>
>();

const recipeDetail: RecipeDetail = {
    createdAt: '2026-06-30T10:00:00.000Z',
    createdBy: 'user-1',
    householdId: 'household-1',
    id: 'recipe-1',
    image: null,
    ingredients: [
        {
            amountG: 80,
            displayAmount: 80,
            displayName: 'Těstoviny',
            displayUnit: 'g',
            id: 'ingredient-2',
            ingredientId: 'global-2',
            position: 2,
        },
        {
            amountG: 120,
            displayAmount: null,
            displayName: 'Rajčata',
            displayUnit: null,
            id: 'ingredient-1',
            ingredientId: 'global-1',
            position: 1,
        },
    ],
    macrosTotal: {
        carbs: 72,
        fat: 12,
        kcal: 520,
        protein: 24,
    },
    mealTypes: [MealSlot.lunch, MealSlot.dinner],
    name: 'Rajčatové těstoviny',
    portions: 2,
    prepTimeMin: 25,
    sourceUrl: 'https://example.com/recept',
    steps: 'Uvař těstoviny. Přidej rajčata.',
};

const mockRecipeQuery = (
    overrides: Partial<ReturnType<typeof useGetRecipe>> = {},
) => {
    mockedUseGetRecipe.mockReturnValue({
        data: undefined,
        isError: false,
        isLoading: false,
        ...overrides,
    } as ReturnType<typeof useGetRecipe>);
};

const mockDeleteRecipeMutation = (
    overrides: Partial<ReturnType<typeof useDeleteRecipe>> = {},
) => {
    mockDeleteRecipeMutateAsync.mockResolvedValue({ success: true });
    mockedUseDeleteRecipe.mockReturnValue({
        isPending: false,
        mutateAsync: mockDeleteRecipeMutateAsync,
        ...overrides,
    } as unknown as ReturnType<typeof useDeleteRecipe>);
};

describe('RecipeDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        mockRecipeQuery();
        mockDeleteRecipeMutation();
    });

    it('loads the recipe detail by route id', async () => {
        mockRecipeQuery({ isLoading: true });

        await render(<RecipeDetailScreen />);

        expect(mockedUseGetRecipe).toHaveBeenCalledWith('recipe-1');
        expect(
            screen.getByTestId('recipe-detail-loading-indicator'),
        ).toBeOnTheScreen();
        expect(
            screen.getByText('Načítám detail receptu...'),
        ).toBeOnTheScreen();
    });

    it('shows an error state when the recipe cannot be loaded', async () => {
        mockRecipeQuery({ isError: true });

        await render(<RecipeDetailScreen />);

        expect(
            screen.getByText('Recept se nepovedlo načíst.'),
        ).toBeOnTheScreen();
    });

    it('shows recipe metadata, macros, ingredients and steps', async () => {
        mockRecipeQuery({ data: { recipe: recipeDetail } });

        await render(<RecipeDetailScreen />);

        expect(screen.getByText('Rajčatové těstoviny')).toBeOnTheScreen();
        expect(
            screen.getByText('2 porce · 25 min · Oběd, Večeře'),
        ).toBeOnTheScreen();
        expect(screen.getByText('https://example.com/recept')).toBeOnTheScreen();
        expect(screen.getByText('520')).toBeOnTheScreen();
        expect(screen.getByText('24g')).toBeOnTheScreen();
        expect(screen.getByText('Rajčata')).toBeOnTheScreen();
        expect(screen.getByText('120 g')).toBeOnTheScreen();
        expect(screen.getByText('Těstoviny')).toBeOnTheScreen();
        expect(screen.getByText('80 g')).toBeOnTheScreen();
        expect(
            screen.getByText('Uvař těstoviny. Přidej rajčata.'),
        ).toBeOnTheScreen();
    });

    it('shows fallbacks for empty ingredients and steps', async () => {
        mockRecipeQuery({
            data: {
                recipe: {
                    ...recipeDetail,
                    ingredients: [],
                    sourceUrl: null,
                    steps: '   ',
                },
            },
        });

        await render(<RecipeDetailScreen />);

        expect(
            screen.getByText('Ingredience zatím nejsou vyplněné.'),
        ).toBeOnTheScreen();
        expect(
            screen.getByText('Postup zatím není vyplněný.'),
        ).toBeOnTheScreen();
    });

    it('opens recipe actions from the floating action button', async () => {
        const user = userEvent.setup();
        mockRecipeQuery({ data: { recipe: recipeDetail } });

        await render(<RecipeDetailScreen />);
        await user.press(screen.getByRole('button', { name: 'Akce receptu' }));

        expect(
            screen.getByRole('button', { name: /Upravit recept/ }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole('button', { name: /Smazat recept/ }),
        ).toBeOnTheScreen();
    });

    it('opens the recipe edit placeholder from recipe actions', async () => {
        const user = userEvent.setup();
        mockRecipeQuery({ data: { recipe: recipeDetail } });

        await render(<RecipeDetailScreen />);
        await user.press(screen.getByRole('button', { name: 'Akce receptu' }));
        await user.press(
            screen.getByRole('button', { name: /Upravit recept/ }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/recipes/[recipeId]/edit',
            params: { recipeId: 'recipe-1' },
        });
    });

    it('opens a confirmation alert before deleting the recipe', async () => {
        const user = userEvent.setup();
        mockRecipeQuery({ data: { recipe: recipeDetail } });

        await render(<RecipeDetailScreen />);
        await user.press(screen.getByRole('button', { name: 'Akce receptu' }));
        await user.press(
            screen.getByRole('button', { name: /Smazat recept/ }),
        );

        expect(Alert.alert).toHaveBeenCalledWith(
            'Smazat recept?',
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
        expect(mockDeleteRecipeMutateAsync).not.toHaveBeenCalled();
    });

    it('deletes the recipe after confirmation and returns to recipes', async () => {
        const user = userEvent.setup();
        mockRecipeQuery({ data: { recipe: recipeDetail } });

        await render(<RecipeDetailScreen />);
        await user.press(screen.getByRole('button', { name: 'Akce receptu' }));
        await user.press(
            screen.getByRole('button', { name: /Smazat recept/ }),
        );

        const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
            onPress?: () => void;
            text: string;
        }[];
        alertButtons.find((button) => button.text === 'Smazat')?.onPress?.();

        await waitFor(() => {
            expect(mockDeleteRecipeMutateAsync).toHaveBeenCalledWith({
                recipeId: 'recipe-1',
            });
        });
        expect(mockedGetGetRecipesQueryKey).toHaveBeenCalledWith();
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/recipes'],
        });
        expect(mockedGetGetRecipeQueryKey).toHaveBeenCalledWith('recipe-1');
        expect(mockRemoveQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/recipes/recipe-1'],
        });
        expect(mockReplace).toHaveBeenCalledWith('/recipes');
    });

    it('shows an error alert when recipe delete fails', async () => {
        const user = userEvent.setup();
        mockRecipeQuery({ data: { recipe: recipeDetail } });
        mockDeleteRecipeMutateAsync.mockRejectedValue(new Error('Delete failed'));

        await render(<RecipeDetailScreen />);
        await user.press(screen.getByRole('button', { name: 'Akce receptu' }));
        await user.press(
            screen.getByRole('button', { name: /Smazat recept/ }),
        );

        const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
            onPress?: () => void;
            text: string;
        }[];
        alertButtons.find((button) => button.text === 'Smazat')?.onPress?.();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Recept se nepovedlo smazat.',
            );
        });
        expect(mockReplace).not.toHaveBeenCalled();
    });
});

describe('RecipeEditScreen', () => {
    it('shows the recipe edit placeholder', async () => {
        await render(<RecipeEditScreen />);

        expect(screen.getByText('Upravit recept')).toBeOnTheScreen();
    });
});
