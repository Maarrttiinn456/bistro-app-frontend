import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
    act,
    render,
    screen,
    userEvent,
    waitFor,
} from '@testing-library/react-native';

import IngredientBarcodeScanScreen from '@/app/(tabs)/ingredients/scan';
import type {
    Ingredient,
    ResolveIngredientBarcodeBody,
    ResolveIngredientBarcodeResponse,
} from '@/src/api/generated/model';
import {
    IngredientBaseUnit,
    ResolveIngredientBarcodeResponseSource,
} from '@/src/api/generated/model';
import { useResolveIngredientBarcode } from '@/src/api/generated/ingredients/ingredients';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockSetQueryData = jest.fn();
const mockRequestPermission = jest.fn();
let mockSearchParams: Record<string, string | undefined> = {};
let mockCameraPermission = {
    canAskAgain: false,
    granted: true,
};

jest.mock('expo-router', () => ({
    useLocalSearchParams: () => mockSearchParams,
    useRouter: () => ({
        back: mockBack,
        push: mockPush,
        replace: mockReplace,
    }),
}));

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
        setQueryData: mockSetQueryData,
    }),
}));

jest.mock('expo-camera', () => {
    const React = jest.requireActual<typeof import('react')>('react');

    return {
        CameraView: (props: Record<string, unknown>) =>
            React.createElement('CameraView', props),
        useCameraPermissions: () => [
            mockCameraPermission,
            mockRequestPermission,
        ],
    };
});

jest.mock('@/src/api/generated/ingredients/ingredients', () => ({
    getGetIngredientsQueryKey: jest.fn(() => ['/v1/ingredients']),
    useResolveIngredientBarcode: jest.fn(),
}));

const mockedUseResolveIngredientBarcode = jest.mocked(
    useResolveIngredientBarcode,
);
const resolveBarcodeMutateAsync = jest.fn<
    (_variables: { data: ResolveIngredientBarcodeBody }) => Promise<ResolveIngredientBarcodeResponse>
>();
const resetResolveBarcode = jest.fn();

const ingredient: Ingredient = {
    archivedAt: null,
    barcode: '3017620422003',
    baseUnit: IngredientBaseUnit.g,
    brand: 'Ferrero',
    carbsPer100: 57.5,
    createdAt: '2026-07-01T10:00:00.000Z',
    fatPer100: 30.9,
    householdId: null,
    id: 'ingredient-1',
    kcalPer100: 539,
    name: 'Nutella',
    proteinPer100: 6.3,
    servingGrams: null,
    servingLabel: null,
};

const resolveResponse: ResolveIngredientBarcodeResponse = {
    created: true,
    ingredient,
    source: ResolveIngredientBarcodeResponseSource.open_food_facts,
};

const mockResolveMutation = () => {
    resolveBarcodeMutateAsync.mockResolvedValue(resolveResponse);
    mockedUseResolveIngredientBarcode.mockReturnValue({
        isPending: false,
        mutateAsync: resolveBarcodeMutateAsync,
        reset: resetResolveBarcode,
    } as unknown as ReturnType<typeof useResolveIngredientBarcode>);
};

const scanBarcode = async (barcode: string) => {
    const camera = screen.getByTestId('barcode-camera');
    const onBarcodeScanned = camera.props.onBarcodeScanned as (result: {
        data: string;
    }) => Promise<void>;

    await act(async () => {
        await onBarcodeScanned({ data: barcode });
    });
};

describe('IngredientBarcodeScanScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams = {};
        mockCameraPermission = {
            canAskAgain: false,
            granted: true,
        };
        mockResolveMutation();
    });

    it('resolves a scanned barcode only once when camera emits duplicates', async () => {
        await render(<IngredientBarcodeScanScreen />);

        const camera = screen.getByTestId('barcode-camera');
        const onBarcodeScanned = camera.props.onBarcodeScanned as (result: {
            data: string;
        }) => Promise<void>;

        await act(async () => {
            await Promise.all([
                onBarcodeScanned({ data: ' 3017620422003 ' }),
                onBarcodeScanned({ data: '3017620422003' }),
            ]);
        });

        expect(resolveBarcodeMutateAsync).toHaveBeenCalledTimes(1);
        expect(resolveBarcodeMutateAsync).toHaveBeenCalledWith({
            data: { barcode: '3017620422003' },
        });
        expect(await screen.findByText('Nutella')).toBeOnTheScreen();
    });

    it('shows resolved ingredient details and source', async () => {
        await render(<IngredientBarcodeScanScreen />);
        await scanBarcode('3017620422003');

        expect(await screen.findByText('Nutella')).toBeOnTheScreen();
        expect(screen.getByText('Ferrero')).toBeOnTheScreen();
        expect(screen.getByText(/Na 100 g: 539 kcal/)).toBeOnTheScreen();
        expect(screen.getByText(/Open Food Facts/)).toBeOnTheScreen();
    });

    it('stores handoff when confirmed from recipe flow', async () => {
        const user = userEvent.setup();
        mockSearchParams = { rowId: 'row-1' };

        await render(<IngredientBarcodeScanScreen />);
        await scanBarcode('3017620422003');
        await user.press(
            await screen.findByRole('button', { name: /Použít surovinu/ }),
        );

        await waitFor(() =>
            expect(mockSetQueryData).toHaveBeenCalledWith(
                expect.any(Array),
                {
                    ingredient,
                    rowId: 'row-1',
                },
            ),
        );
        expect(mockBack).toHaveBeenCalled();
    });

    it('opens manual creation with barcode on 404', async () => {
        const user = userEvent.setup();
        resolveBarcodeMutateAsync.mockRejectedValueOnce({
            response: { status: 404 },
        });

        await render(<IngredientBarcodeScanScreen />);
        await scanBarcode('3017620422003');
        await user.press(
            await screen.findByRole('button', { name: /Založit ručně/ }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/ingredients/create',
            params: { barcode: '3017620422003' },
        });
    });

    it('opens manual creation with barcode on incomplete nutrition data', async () => {
        const user = userEvent.setup();
        resolveBarcodeMutateAsync.mockRejectedValueOnce({
            response: { status: 422 },
        });

        await render(<IngredientBarcodeScanScreen />);
        await scanBarcode('3017620422003');

        expect(
            await screen.findByText(
                'Produkt byl nalezen, ale nemá kompletní nutriční hodnoty.',
            ),
        ).toBeOnTheScreen();
        await user.press(
            screen.getByRole('button', { name: /Založit ručně/ }),
        );

        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/ingredients/create',
            params: { barcode: '3017620422003' },
        });
    });

    it('offers retry when external lookup fails', async () => {
        const user = userEvent.setup();
        resolveBarcodeMutateAsync.mockRejectedValueOnce({
            response: { status: 502 },
        });

        await render(<IngredientBarcodeScanScreen />);
        await scanBarcode('3017620422003');
        await user.press(
            await screen.findByRole('button', { name: /Zkusit znovu/ }),
        );

        await waitFor(() =>
            expect(resolveBarcodeMutateAsync).toHaveBeenCalledTimes(2),
        );
        expect(await screen.findByText('Nutella')).toBeOnTheScreen();
    });
});
