import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
    type BarcodeScanningResult,
    type BarcodeType,
    CameraView,
    useCameraPermissions,
} from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    getGetIngredientsQueryKey,
    useResolveIngredientBarcode,
} from '@/src/api/generated/ingredients/ingredients';
import {
    ResolveIngredientBarcodeResponseSource,
    type ErrorResponse,
    type Ingredient,
    type ResolveIngredientBarcodeResponse,
} from '@/src/api/generated/model';
import {
    createdIngredientHandoffQueryKey,
    type CreatedIngredientHandoff,
} from '@/src/ingredients/createIngredientHandoff';

const barcodeTypes: BarcodeType[] = [
    'ean13',
    'ean8',
    'upc_a',
    'upc_e',
    'code128',
];

const normalizeParam = (value: string | string[] | undefined) => {
    return Array.isArray(value) ? value[0] ?? '' : value ?? '';
};

const formatIngredientNumber = (value: number) => {
    return Number(value.toFixed(1)).toString();
};

const formatNutritionPer100 = (ingredient: Ingredient) => {
    return `Na 100 ${ingredient.baseUnit}: ${formatIngredientNumber(
        ingredient.kcalPer100,
    )} kcal · B ${formatIngredientNumber(
        ingredient.proteinPer100,
    )}g · S ${formatIngredientNumber(
        ingredient.carbsPer100,
    )}g · T ${formatIngredientNumber(ingredient.fatPer100)}g`;
};

const getSourceLabel = (source: ResolveIngredientBarcodeResponse['source']) => {
    return source === ResolveIngredientBarcodeResponseSource.local
        ? 'Nalezena lokálně'
        : 'Importována z Open Food Facts';
};

const getResolveErrorMessage = (error: unknown) => {
    const status = (error as AxiosError<ErrorResponse>)?.response?.status;

    if (status === 400) {
        return 'Čárový kód se nepovedlo zpracovat.';
    }

    if (status === 401) {
        return 'Nejsi přihlášený. Přihlas se a zkus to znovu.';
    }

    if (status === 404) {
        return 'Produkt nebyl nalezen v externí databázi.';
    }

    if (status === 422) {
        return 'Produkt byl nalezen, ale nemá kompletní nutriční hodnoty.';
    }

    if (status === 502) {
        return 'Externí databáze je momentálně nedostupná.';
    }

    return 'Čárový kód se nepovedlo ověřit.';
};

const getResolveErrorStatus = (error: unknown) => {
    return (error as AxiosError<ErrorResponse>)?.response?.status ?? null;
};

const IngredientResult = ({
    response,
    onConfirm,
}: {
    response: ResolveIngredientBarcodeResponse;
    onConfirm: () => void;
}) => {
    const { ingredient } = response;

    return (
        <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{ingredient.name}</Text>
            {ingredient.brand ? (
                <Text style={styles.metaText}>{ingredient.brand}</Text>
            ) : null}
            <Text style={styles.nutritionText}>
                {formatNutritionPer100(ingredient)}
            </Text>
            <Text style={styles.sourceText}>
                {getSourceLabel(response.source)}
            </Text>
            <Pressable
                accessibilityRole="button"
                style={styles.primaryButton}
                onPress={onConfirm}
            >
                <Text style={styles.primaryButtonText}>Použít surovinu</Text>
            </Pressable>
        </View>
    );
};

const IngredientBarcodeScanScreen = () => {
    const params = useLocalSearchParams<{
        rowId?: string | string[];
    }>();
    const rowId = normalizeParam(params.rowId);
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

    const handleResolveBarcode = async (barcode: string) => {
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
            setErrorMessage(getResolveErrorMessage(error));
            setErrorStatus(getResolveErrorStatus(error));
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

        await handleResolveBarcode(barcode);
    };

    const handleManualSubmit = () => {
        void handleResolveBarcode(manualBarcode);
    };

    const handleTryAgain = () => {
        void handleResolveBarcode(lockedBarcode ?? manualBarcode);
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
            queryClient.setQueryData<CreatedIngredientHandoff>(
                createdIngredientHandoffQueryKey,
                {
                    ingredient: result.ingredient,
                    rowId,
                },
            );
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
    const canCreateManually = errorStatus === 404 || errorStatus === 422;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Skenovat kód</Text>
                    <Pressable
                        accessibilityRole="button"
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.closeButtonText}>Zavřít</Text>
                    </Pressable>
                </View>

                <View style={styles.cameraFrame}>
                    {isCameraActive ? (
                        <CameraView
                            barcodeScannerSettings={{ barcodeTypes }}
                            facing="back"
                            style={styles.camera}
                            testID="barcode-camera"
                            onBarcodeScanned={handleBarcodeScanned}
                        />
                    ) : (
                        <View style={styles.cameraPlaceholder}>
                            {isResolving ? (
                                <>
                                    <ActivityIndicator
                                        color="#ffffff"
                                        testID="barcode-resolve-loading"
                                    />
                                    <Text style={styles.cameraPlaceholderText}>
                                        Ověřuji {lockedBarcode}...
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.cameraPlaceholderText}>
                                    Kamera je pozastavená.
                                </Text>
                            )}
                        </View>
                    )}
                </View>

                {!permission?.granted ? (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Pro skenování povol kameru, nebo zadej kód ručně.
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            style={styles.secondaryButton}
                            onPress={requestPermission}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Povolit kameru
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={styles.manualBox}>
                    <Text style={styles.sectionTitle}>Ruční zadání</Text>
                    <TextInput
                        accessibilityLabel="EAN kód"
                        keyboardType="number-pad"
                        placeholder="Např. 3017620422003"
                        style={styles.input}
                        value={manualBarcode}
                        onChangeText={setManualBarcode}
                    />
                    <Pressable
                        accessibilityRole="button"
                        disabled={isResolving}
                        style={[
                            styles.secondaryButton,
                            isResolving ? styles.disabledButton : null,
                        ]}
                        onPress={handleManualSubmit}
                    >
                        <Text style={styles.secondaryButtonText}>
                            Ověřit kód
                        </Text>
                    </Pressable>
                </View>

                {result ? (
                    <IngredientResult
                        response={result}
                        onConfirm={() => void handleConfirm()}
                    />
                ) : null}

                {errorMessage ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText} selectable>
                            {errorMessage}
                        </Text>
                        {canCreateManually ? (
                            <Pressable
                                accessibilityRole="button"
                                style={styles.secondaryButton}
                                onPress={handleManualCreate}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Založit ručně
                                </Text>
                            </Pressable>
                        ) : null}
                        {errorStatus === 502 ? (
                            <Pressable
                                accessibilityRole="button"
                                disabled={isResolving}
                                style={[
                                    styles.secondaryButton,
                                    isResolving ? styles.disabledButton : null,
                                ]}
                                onPress={handleTryAgain}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Zkusit znovu
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}

                <Pressable
                    accessibilityRole="button"
                    style={styles.textButton}
                    onPress={resetScan}
                >
                    <Text style={styles.textButtonText}>Skenovat znovu</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
    cameraFrame: {
        backgroundColor: '#111827',
        borderRadius: 8,
        height: 280,
        overflow: 'hidden',
    },
    cameraPlaceholder: {
        alignItems: 'center',
        flex: 1,
        gap: 12,
        justifyContent: 'center',
        padding: 20,
    },
    cameraPlaceholderText: {
        color: '#ffffff',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    closeButton: {
        justifyContent: 'center',
        minHeight: 40,
        paddingHorizontal: 8,
    },
    closeButtonText: {
        color: '#175cd3',
        fontSize: 15,
        fontWeight: '700',
    },
    container: {
        backgroundColor: '#ffffff',
        flex: 1,
    },
    content: {
        gap: 16,
        padding: 16,
        paddingBottom: 32,
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorBox: {
        borderColor: '#fecdca',
        borderRadius: 8,
        borderWidth: 1,
        gap: 10,
        padding: 12,
    },
    errorText: {
        color: '#b42318',
        fontSize: 14,
        lineHeight: 20,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    infoBox: {
        backgroundColor: '#f2f4f7',
        borderRadius: 8,
        gap: 10,
        padding: 12,
    },
    infoText: {
        color: '#475467',
        fontSize: 14,
        lineHeight: 20,
    },
    input: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        color: '#111827',
        fontSize: 15,
        minHeight: 46,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    manualBox: {
        gap: 10,
    },
    metaText: {
        color: '#667085',
        fontSize: 14,
        lineHeight: 20,
    },
    nutritionText: {
        color: '#344054',
        fontSize: 14,
        lineHeight: 20,
    },
    primaryButton: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 8,
        justifyContent: 'center',
        minHeight: 46,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    resultBox: {
        borderColor: '#abefc6',
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
        padding: 12,
    },
    resultTitle: {
        color: '#111827',
        fontSize: 20,
        fontWeight: '800',
    },
    secondaryButton: {
        alignItems: 'center',
        borderColor: '#111827',
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 42,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '700',
    },
    sectionTitle: {
        color: '#344054',
        fontSize: 14,
        fontWeight: '700',
    },
    sourceText: {
        color: '#027a48',
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 18,
    },
    textButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 42,
    },
    textButtonText: {
        color: '#175cd3',
        fontSize: 14,
        fontWeight: '700',
    },
    title: {
        color: '#111827',
        fontSize: 24,
        fontWeight: '800',
    },
});

export default IngredientBarcodeScanScreen;
