import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import CreateRecipe from '@/app/(tabs)/recipes/create';
import type {
    CreateRecipeBody,
    Ingredient,
    RecipeDetailResponse,
} from '@/src/api/generated/model';
import {
    GetIngredientsScope,
    IngredientBaseUnit,
    MealSlot,
} from '@/src/api/generated/model';
import { useGetIngredients } from '@/src/api/generated/ingredients/ingredients';
import { useCreateRecipe } from '@/src/api/generated/recipes/recipes';

const mockPush = jest.fn();
const mockGetQueryData = jest.fn();
const mockSetQueryData = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('expo-router', () => ({
    useFocusEffect: (callback: () => void) => callback(),
    useRouter: () => ({
        push: mockPush,
    }),
}));

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        getQueryData: mockGetQueryData,
        invalidateQueries: mockInvalidateQueries,
        setQueryData: mockSetQueryData,
    }),
}));

jest.mock('@/src/api/generated/ingredients/ingredients', () => ({
    getGetIngredientsQueryKey: jest.fn(() => ['/v1/ingredients']),
    useGetIngredients: jest.fn(),
}));

jest.mock('@/src/api/generated/recipes/recipes', () => ({
    getGetRecipesQueryKey: jest.fn(() => ['/v1/recipes']),
    useCreateRecipe: jest.fn(),
}));

const mockedUseGetIngredients = jest.mocked(useGetIngredients);
const mockedUseCreateRecipe = jest.mocked(useCreateRecipe);

const createRecipeMutateAsync = jest.fn<
    (_variables: { data: CreateRecipeBody }) => Promise<RecipeDetailResponse>
>();

const ingredient: Ingredient = {
    barcode: null,
    baseUnit: IngredientBaseUnit.g,
    brand: 'Bio farma',
    carbsPer100: 20,
    createdAt: '2026-07-01T10:00:00.000Z',
    fatPer100: 5,
    householdId: null,
    id: 'ingredient-1',
    kcalPer100: 100,
    name: 'Rajčata',
    proteinPer100: 10,
    servingGrams: null,
    servingLabel: null,
};

const mockIngredientsQuery = (ingredients: Ingredient[] = [ingredient]) => {
    mockedUseGetIngredients.mockReturnValue({
        data: { ingredients },
        isError: false,
        isLoading: false,
    } as ReturnType<typeof useGetIngredients>);
};

const mockCreateRecipeMutation = () => {
    createRecipeMutateAsync.mockResolvedValue({
        recipe: { id: 'recipe-1' },
    } as RecipeDetailResponse);
    mockedUseCreateRecipe.mockReturnValue({
        isPending: false,
        mutateAsync: createRecipeMutateAsync,
    } as unknown as ReturnType<typeof useCreateRecipe>);
};

const fillRequiredRecipeFields = async () => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Název receptu'), 'Letní salát');
    await user.press(screen.getByRole('button', { name: 'Oběd' }));

    return user;
};

const selectCatalogIngredient = async () => {
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Vyhledat surovinu 1'), 'Rajčata');
    await user.press(screen.getByRole('button', { name: /Rajčata/ }));

    return user;
};

describe('CreateRecipe', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetQueryData.mockReturnValue(null);
        mockIngredientsQuery();
        mockCreateRecipeMutation();
    });

    it('renders the simplified base form and first ingredient row', async () => {
        await render(<CreateRecipe />);

        expect(screen.getByLabelText('Název receptu')).toBeOnTheScreen();
        expect(screen.getByLabelText('Počet porcí')).toBeOnTheScreen();
        expect(screen.getByText('Surovina 1')).toBeOnTheScreen();
        expect(screen.getByLabelText('Vyhledat surovinu 1')).toBeOnTheScreen();
        expect(
            screen.getByRole('button', { name: 'Přidat surovinu' }),
        ).toBeOnTheScreen();
        expect(screen.queryByLabelText('URL obrázku')).toBeNull();
    });

    it('searches ingredients with the all scope', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipe />);
        await user.type(screen.getByLabelText('Vyhledat surovinu 1'), 'raj');

        expect(mockedUseGetIngredients).toHaveBeenLastCalledWith(
            {
                query: 'raj',
                scope: GetIngredientsScope.all,
            },
            {
                query: {
                    enabled: true,
                },
            },
        );
    });

    it('selects a catalog ingredient and shows compact nutrition', async () => {
        await render(<CreateRecipe />);
        await selectCatalogIngredient();

        expect(screen.getByText('Rajčata')).toBeOnTheScreen();
        expect(screen.getByText(/100 g: 100 kcal/)).toBeOnTheScreen();
    });

    it('calculates approximate recipe macros from selected ingredients', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipe />);
        await selectCatalogIngredient();
        await user.type(screen.getByLabelText('Gramáž suroviny 1'), '200');

        expect(screen.getByText('200')).toBeOnTheScreen();
        expect(screen.getByText('20g')).toBeOnTheScreen();
        expect(screen.getByText('40g')).toBeOnTheScreen();
        expect(screen.getByText('10g')).toBeOnTheScreen();
    });

    it('blocks submit when a catalog ingredient is not selected', async () => {
        await render(<CreateRecipe />);
        const user = await fillRequiredRecipeFields();

        await user.type(screen.getByLabelText('Gramáž suroviny 1'), '100');
        await user.press(
            screen.getByRole('button', { name: 'Vytvořit recept' }),
        );

        expect(
            screen.getByText(
                'Vyber surovinu z katalogu, nebo přepni na volnou surovinu bez maker.',
            ),
        ).toBeOnTheScreen();
        expect(createRecipeMutateAsync).not.toHaveBeenCalled();
    });

    it('submits catalog ingredients without macros', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipe />);
        await user.type(screen.getByLabelText('Název receptu'), 'Letní salát');
        await user.press(screen.getByRole('button', { name: 'Oběd' }));
        await selectCatalogIngredient();
        await user.type(screen.getByLabelText('Gramáž suroviny 1'), '120');
        await user.press(
            screen.getByRole('button', {
                name: 'Zobrazit jako ks/lžíce',
            }),
        );
        await user.type(
            screen.getByLabelText('Zobrazovací množství suroviny 1'),
            '2',
        );
        await user.type(
            screen.getByLabelText('Zobrazovací jednotka suroviny 1'),
            'ks',
        );
        await user.press(
            screen.getByRole('button', { name: 'Vytvořit recept' }),
        );

        await waitFor(() => expect(createRecipeMutateAsync).toHaveBeenCalled());

        const submittedBody = createRecipeMutateAsync.mock.calls[0][0].data;

        expect(submittedBody).toEqual(
            expect.objectContaining({
                ingredients: [
                    {
                        amountG: 120,
                        displayAmount: 2,
                        displayName: 'Rajčata',
                        displayUnit: 'ks',
                        ingredientId: 'ingredient-1',
                        position: 0,
                    },
                ],
                mealTypes: [MealSlot.lunch],
                name: 'Letní salát',
                portions: 1,
            }),
        );
        expect(submittedBody).not.toHaveProperty('macrosTotal');
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ['/v1/recipes'],
        });
        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/recipes/[recipeId]',
            params: { recipeId: 'recipe-1' },
        });
    });

    it('submits a free text ingredient only after explicit no-macro mode is selected', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipe />);
        await user.type(screen.getByLabelText('Název receptu'), 'Vývar');
        await user.press(screen.getByRole('button', { name: 'Oběd' }));
        await user.press(
            screen.getByRole('button', {
                name: 'Nemám v katalogu',
            }),
        );
        await user.type(
            screen.getByLabelText('Volná textová surovina 1'),
            'Sůl',
        );
        await user.type(screen.getByLabelText('Gramáž suroviny 1'), '0');
        await user.press(
            screen.getByRole('button', { name: 'Vytvořit recept' }),
        );

        await waitFor(() => expect(createRecipeMutateAsync).toHaveBeenCalled());

        expect(
            screen.getByText(
                'Nebude se započítávat do maker receptu.',
            ),
        ).toBeOnTheScreen();
        expect(
            createRecipeMutateAsync.mock.calls[0][0].data.ingredients[0],
        ).toEqual(
            expect.objectContaining({
                displayName: 'Sůl',
                ingredientId: null,
            }),
        );
    });

    it('opens a separate create ingredient screen for missing ingredients', async () => {
        const user = userEvent.setup();
        mockIngredientsQuery([]);

        await render(<CreateRecipe />);
        await user.type(screen.getByLabelText('Vyhledat surovinu 1'), 'Tempeh');
        await user.press(
            screen.getByRole('button', { name: 'Vytvořit surovinu' }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/ingredients/create',
            params: expect.objectContaining({
                name: 'Tempeh',
            }),
        });
    });

    it('keeps optional details hidden until expanded and submits them when filled', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipe />);
        await user.press(
            screen.getByRole('button', { name: 'Volitelné detaily' }),
        );
        await user.type(screen.getByLabelText('URL obrázku'), 'https://img.test');
        await user.type(screen.getByLabelText('Zdroj receptu'), 'https://src.test');
        await user.type(screen.getByLabelText('Postup receptu'), 'Promíchat');
        await user.type(screen.getByLabelText('Název receptu'), 'Letní salát');
        await user.press(screen.getByRole('button', { name: 'Oběd' }));
        await selectCatalogIngredient();
        await user.type(screen.getByLabelText('Gramáž suroviny 1'), '120');
        await user.press(
            screen.getByRole('button', { name: 'Vytvořit recept' }),
        );

        await waitFor(() => expect(createRecipeMutateAsync).toHaveBeenCalled());

        expect(createRecipeMutateAsync.mock.calls[0][0].data).toEqual(
            expect.objectContaining({
                image: 'https://img.test',
                sourceUrl: 'https://src.test',
                steps: 'Promíchat',
            }),
        );
    });
});
