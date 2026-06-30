import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent } from '@testing-library/react-native';

import Recipes from '@/app/(tabs)/recipes';
import type { Recipe } from '@/src/api/generated/model';
import { MealSlot } from '@/src/api/generated/model';
import { useGetRecipes } from '@/src/api/generated/recipes/recipes';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => () => null);

jest.mock('@/src/api/generated/recipes/recipes', () => ({
    useGetRecipes: jest.fn(),
}));

const mockedUseGetRecipes = jest.mocked(useGetRecipes);

const recipe: Recipe = {
    createdAt: '2026-06-30T10:00:00.000Z',
    createdBy: 'user-1',
    householdId: 'household-1',
    id: 'recipe-1',
    image: null,
    mealTypes: [MealSlot.lunch],
    name: 'Rajčatové těstoviny',
    portions: 2,
    prepTimeMin: 25,
    sourceUrl: null,
    steps: 'Uvař těstoviny a promíchej s omáčkou.',
};

const mockRecipesQuery = (
    overrides: Partial<ReturnType<typeof useGetRecipes>> = {},
) => {
    mockedUseGetRecipes.mockReturnValue({
        data: undefined,
        isError: false,
        isLoading: false,
        ...overrides,
    } as ReturnType<typeof useGetRecipes>);
};

describe('Recipes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRecipesQuery();
    });

    it('shows a loading indicator while recipes are loading', async () => {
        mockRecipesQuery({ isLoading: true });

        await render(<Recipes />);

        expect(
            screen.getByTestId('recipes-loading-indicator'),
        ).toBeOnTheScreen();
        expect(screen.getByText('Načítám recepty...')).toBeOnTheScreen();
    });

    it('shows an error state when recipes cannot be loaded', async () => {
        mockRecipesQuery({ isError: true });

        await render(<Recipes />);

        expect(
            screen.getByText('Recepty se nepovedlo načíst.'),
        ).toBeOnTheScreen();
    });

    it('shows an empty state when there are no recipes', async () => {
        mockRecipesQuery({ data: { recipes: [] } });

        await render(<Recipes />);

        expect(
            screen.getByText('Zatím nemáš žádné recepty.'),
        ).toBeOnTheScreen();
    });

    it('shows recipe details from the recipes response', async () => {
        mockRecipesQuery({ data: { recipes: [recipe] } });

        await render(<Recipes />);

        expect(screen.getByText('Rajčatové těstoviny')).toBeOnTheScreen();
        expect(screen.getByText('2 porce · 25 min')).toBeOnTheScreen();
        expect(screen.getByText('Oběd')).toBeOnTheScreen();
    });

    it('opens the recipe detail when a recipe is pressed', async () => {
        const user = userEvent.setup();
        mockRecipesQuery({ data: { recipes: [recipe] } });

        await render(<Recipes />);
        await user.press(
            screen.getByRole('button', { name: /Rajčatové těstoviny/ }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/recipes/[recipeId]',
            params: { recipeId: 'recipe-1' },
        });
    });

    it('shows the add recipe floating action button', async () => {
        mockRecipesQuery({ data: { recipes: [recipe] } });

        await render(<Recipes />);

        expect(
            screen.getByRole('button', { name: 'Přidat recept' }),
        ).toBeOnTheScreen();
    });

    it('opens add recipe options from the floating action button', async () => {
        const user = userEvent.setup();
        mockRecipesQuery({ data: { recipes: [recipe] } });

        await render(<Recipes />);
        await user.press(
            screen.getByRole('button', { name: 'Přidat recept' }),
        );

        expect(
            screen.getByRole('button', { name: /Ručně/ }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole('button', { name: /Import z URL/ }),
        ).toBeOnTheScreen();
        expect(screen.getByText('Připravujeme')).toBeOnTheScreen();
    });

    it('closes add recipe options when manual add is pressed', async () => {
        const user = userEvent.setup();
        mockRecipesQuery({ data: { recipes: [recipe] } });

        await render(<Recipes />);
        await user.press(
            screen.getByRole('button', { name: 'Přidat recept' }),
        );
        await user.press(screen.getByRole('button', { name: /Ručně/ }));

        expect(screen.queryByText('Ručně')).not.toBeOnTheScreen();
        expect(screen.queryByText('Import z URL')).not.toBeOnTheScreen();
    });
});
