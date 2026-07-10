import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import CreateRecipe from '@/app/(tabs)/recipes/create';
import CreateRecipeIngredientPickerScreen from '@/app/(tabs)/recipes/ingredient-picker';
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
const mockBack = jest.fn();
const mockGetQueryData = jest.fn();
const mockSetQueryData = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockUseLocalSearchParams = jest.fn(() => ({ rowId: 'picker-row' }));

jest.mock('expo-router', () => ({
    useFocusEffect: (callback: () => void) => callback(),
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    useRouter: () => ({
        back: mockBack,
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
    archivedAt: null,
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

const mockIngredientHandoff = (rowId = 'handoff-row') => {
    mockGetQueryData.mockReturnValueOnce({
        ingredient,
        rowId,
    });
};

describe('CreateRecipe', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        mockGetQueryData.mockReturnValue(null);
        mockIngredientsQuery();
        mockCreateRecipeMutation();
    });

    it('renders the simplified base form without an empty ingredient row', async () => {
        await render(<CreateRecipe />);

        expect(screen.getByLabelText('Název receptu')).toBeOnTheScreen();
        expect(screen.getByLabelText('Počet porcí')).toBeOnTheScreen();
        expect(screen.getByText('Zatím tu není žádná surovina.')).toBeOnTheScreen();
        expect(screen.queryByText('Surovina 1')).toBeNull();
        expect(
            screen.getByRole('button', { name: 'Přidat surovinu' }),
        ).toBeOnTheScreen();
        expect(screen.queryByLabelText('URL obrázku')).toBeNull();
    });

    it('opens ingredient picker from the add button', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipe />);
        await user.press(screen.getByRole('button', { name: 'Přidat surovinu' }));

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/recipes/ingredient-picker',
            params: expect.objectContaining({
                rowId: expect.any(String),
            }),
        });
    });

    it('searches ingredients with the all scope from the picker', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipeIngredientPickerScreen />);
        await user.type(screen.getByLabelText('Vyhledat surovinu'), 'raj');

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

    it('stores selected picker ingredient as a recipe handoff', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipeIngredientPickerScreen />);
        await user.type(screen.getByLabelText('Vyhledat surovinu'), 'raj');
        await user.press(screen.getByRole('button', { name: 'Přidat Rajčata' }));

        expect(mockSetQueryData).toHaveBeenCalledWith(expect.any(Array), {
            ingredient,
            rowId: 'picker-row',
        });
        expect(mockBack).toHaveBeenCalled();
    });

    it('selects a catalog ingredient and shows a compact amount row', async () => {
        mockIngredientHandoff();

        await render(<CreateRecipe />);

        expect(screen.getByText('Rajčata')).toBeOnTheScreen();
        expect(screen.getByText(/100 g: 100 kcal/)).toBeOnTheScreen();
        expect(
            screen.getByLabelText('Množství suroviny 1 v gramech'),
        ).toBeOnTheScreen();
        expect(screen.queryByLabelText('Vyhledat surovinu')).toBeNull();
    });

    it('removes the selected ingredient row', async () => {
        const user = userEvent.setup();
        mockIngredientHandoff();

        await render(<CreateRecipe />);
        await user.press(screen.getByRole('button', { name: 'Odebrat' }));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Odebrat surovinu?',
            '"Rajčata" se odebere z receptu.',
            expect.any(Array),
        );
        expect(screen.getByText('Rajčata')).toBeOnTheScreen();

        const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2] as {
            onPress?: () => void;
            text: string;
        }[];

        await act(async () => {
            alertButtons.find((button) => button.text === 'Odebrat')?.onPress?.();
        });

        await waitFor(() => {
            expect(screen.queryByText('Rajčata')).toBeNull();
        });
        expect(screen.getByText('Zatím tu není žádná surovina.')).toBeOnTheScreen();
    });

    it('calculates approximate recipe macros from selected ingredients', async () => {
        const user = userEvent.setup();
        mockIngredientHandoff();

        await render(<CreateRecipe />);
        await user.type(
            screen.getByLabelText('Množství suroviny 1 v gramech'),
            '200',
        );

        expect(screen.getByText('200')).toBeOnTheScreen();
        expect(screen.getByText('20g')).toBeOnTheScreen();
        expect(screen.getByText('40g')).toBeOnTheScreen();
        expect(screen.getByText('10g')).toBeOnTheScreen();
    });

    it('blocks submit when no ingredient is added', async () => {
        await render(<CreateRecipe />);
        const user = await fillRequiredRecipeFields();

        await user.press(
            screen.getByRole('button', { name: 'Vytvořit recept' }),
        );

        expect(screen.getByText('Přidej alespoň jednu surovinu.')).toBeOnTheScreen();
        expect(createRecipeMutateAsync).not.toHaveBeenCalled();
    });

    it('submits catalog ingredients without macros', async () => {
        const user = userEvent.setup();
        mockIngredientHandoff();

        await render(<CreateRecipe />);
        await user.type(screen.getByLabelText('Název receptu'), 'Letní salát');
        await user.press(screen.getByRole('button', { name: 'Oběd' }));
        await user.type(
            screen.getByLabelText('Množství suroviny 1 v gramech'),
            '120',
        );
        await user.press(
            screen.getByRole('button', {
                name: 'Zadat ks/lžíce',
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

    it('opens a separate create ingredient screen for missing ingredients', async () => {
        const user = userEvent.setup();
        mockIngredientsQuery([]);

        await render(<CreateRecipeIngredientPickerScreen />);
        await user.type(screen.getByLabelText('Vyhledat surovinu'), 'Tempeh');
        await user.press(
            screen.getByRole('button', {
                name: 'Přidat "Tempeh" do databáze',
            }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/recipes/ingredient-create',
            params: expect.objectContaining({
                name: 'Tempeh',
                rowId: 'picker-row',
            }),
        });
    });

    it('opens barcode scanner from the ingredient picker', async () => {
        const user = userEvent.setup();

        await render(<CreateRecipeIngredientPickerScreen />);
        await user.press(
            screen.getByRole('button', { name: 'Naskenovat kód' }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/recipes/ingredient-scan',
            params: expect.objectContaining({
                rowId: 'picker-row',
            }),
        });
    });

    it('adds a handoff ingredient from create or scan after returning to the recipe', async () => {
        mockGetQueryData
            .mockReturnValueOnce({
                ingredient,
                rowId: 'handoff-row',
            })
            .mockReturnValue(null);

        await render(<CreateRecipe />);

        expect(screen.getByText('Rajčata')).toBeOnTheScreen();
        expect(
            screen.getByLabelText('Množství suroviny 1 v gramech'),
        ).toBeOnTheScreen();
        expect(mockSetQueryData).toHaveBeenCalledWith(expect.any(Array), null);
    });

    it('keeps optional details hidden until expanded and submits them when filled', async () => {
        const user = userEvent.setup();
        mockIngredientHandoff();

        await render(<CreateRecipe />);
        await user.press(
            screen.getByRole('button', { name: 'Volitelné detaily' }),
        );
        await user.type(screen.getByLabelText('URL obrázku'), 'https://img.test');
        await user.type(screen.getByLabelText('Zdroj receptu'), 'https://src.test');
        await user.type(screen.getByLabelText('Postup receptu'), 'Promíchat');
        await user.type(screen.getByLabelText('Název receptu'), 'Letní salát');
        await user.press(screen.getByRole('button', { name: 'Oběd' }));
        await user.type(
            screen.getByLabelText('Množství suroviny 1 v gramech'),
            '120',
        );
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
