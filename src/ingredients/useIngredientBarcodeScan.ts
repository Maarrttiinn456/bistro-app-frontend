import { useQueryClient } from '@tanstack/react-query';
import {
    type BarcodeScanningResult,
    type BarcodeType,
    useCameraPermissions,
} from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import {
    getGetIngredientsQueryKey,
    useResolveIngredientBarcode,
} from '@/src/api/generated/ingredients/ingredients';
import type { ResolveIngredientBarcodeResponse } from '@/src/api/generated/model';
import { setCreatedIngredientHandoff } from '@/src/ingredients/createIngredientHandoff';
import {
    canCreateIngredientManuallyFromBarcodeError,
    getResolveIngredientBarcodeErrorMessage,
    getResolveIngredientBarcodeErrorStatus,
} from '@/src/ingredients/ingredientBarcodeScan';

const barcodeTypes: BarcodeType[] = [
    'ean13',
    'ean8',
    'upc_a',
    'upc_e',
    'code128',
];

type UseIngredientBarcodeScanParams = {
    rowId?: string;
};

export const useIngredientBarcodeScan = ({
    rowId = '',
}: UseIngredientBarcodeScanParams = {}) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [permission, requestPermission] = useCameraPermissions();
    const resolveMutation = useResolveIngredientBarcode();
    const [manualBarcode, setManualBarcode] = useState('');
    const [lockedBarcode, setLockedBarcode] = useState<string | null>(null);
    const [result, setResult] =
        useState<ResolveIngredientBarcodeResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
    const scanLockedRef = useRef(false);
    const pendingBarcodeRef = useRef<string | null>(null);

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            void requestPermission();
        }
    }, [permission, requestPermission]);

    const resetScan = () => {
        scanLockedRef.current = false;
        pendingBarcodeRef.current = null;
        setLockedBarcode(null);
        setResult(null);
        setErrorMessage(null);
        setErrorStatus(null);
        resolveMutation.reset();
    };

    const resolveBarcode = async (barcode: string) => {
        const trimmedBarcode = barcode.trim();

        if (!trimmedBarcode.length) {
            setErrorMessage('Zadej EAN kód.');
            setErrorStatus(null);
            return;
        }

        if (pendingBarcodeRef.current === trimmedBarcode) {
            return;
        }

        scanLockedRef.current = true;
        pendingBarcodeRef.current = trimmedBarcode;
        setLockedBarcode(trimmedBarcode);
        setManualBarcode(trimmedBarcode);
        setResult(null);
        setErrorMessage(null);
        setErrorStatus(null);

        try {
            const response = await resolveMutation.mutateAsync({
                data: { barcode: trimmedBarcode },
            });

            setResult(response);
            await queryClient.invalidateQueries({
                queryKey: getGetIngredientsQueryKey(),
            });
        } catch (error) {
            setErrorMessage(getResolveIngredientBarcodeErrorMessage(error));
            setErrorStatus(getResolveIngredientBarcodeErrorStatus(error));
        } finally {
            if (pendingBarcodeRef.current === trimmedBarcode) {
                pendingBarcodeRef.current = null;
            }
        }
    };

    const handleBarcodeScanned = async (
        scanningResult: BarcodeScanningResult,
    ) => {
        if (scanLockedRef.current) {
            return;
        }

        const barcode = scanningResult.data.trim();

        if (!barcode.length) {
            return;
        }

        await resolveBarcode(barcode);
    };

    const handleManualSubmit = () => {
        void resolveBarcode(manualBarcode);
    };

    const handleTryAgain = () => {
        void resolveBarcode(lockedBarcode ?? manualBarcode);
    };

    const handleManualCreate = () => {
        const barcode = (lockedBarcode ?? manualBarcode).trim();
        const routeParams: Record<string, string> = {};

        if (barcode.length > 0) {
            routeParams.barcode = barcode;
        }

        if (rowId.length > 0) {
            routeParams.rowId = rowId;
        }

        router.push({
            pathname: '/ingredients/create',
            params: routeParams,
        });
    };

    const handleConfirm = async () => {
        if (!result) {
            return;
        }

        await queryClient.invalidateQueries({
            queryKey: getGetIngredientsQueryKey(),
        });

        if (rowId.length > 0) {
            setCreatedIngredientHandoff(queryClient, {
                ingredient: result.ingredient,
                rowId,
            });
            router.back();
            return;
        }

        router.replace({
            pathname: '/ingredients/[ingredientId]',
            params: { ingredientId: result.ingredient.id },
        });
    };

    const isResolving = resolveMutation.isPending;
    const isCameraActive =
        permission?.granted === true &&
        lockedBarcode === null &&
        result === null &&
        errorMessage === null;
    const canCreateManually =
        canCreateIngredientManuallyFromBarcodeError(errorStatus);

    return {
        barcodeTypes,
        canCreateManually,
        errorMessage,
        errorStatus,
        isCameraActive,
        isResolving,
        lockedBarcode,
        manualBarcode,
        permission,
        result,
        handleBarcodeScanned,
        handleClose: () => router.back(),
        handleConfirm,
        handleManualCreate,
        handleManualSubmit,
        handleTryAgain,
        requestPermission,
        resetScan,
        setManualBarcode,
    };
};
