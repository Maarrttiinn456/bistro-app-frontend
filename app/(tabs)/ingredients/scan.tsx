import { CameraView } from 'expo-camera';
import { useLocalSearchParams, usePathname } from 'expo-router';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';

import type { ResolveIngredientBarcodeResponse } from '@/src/api/generated/model';
import { Screen, screenContentStyles } from '@/src/components/Screen';
import { getIngredientBarcodeSourceLabel } from '@/src/ingredients/ingredientBarcodeScan';
import { formatIngredientNutritionPer100 } from '@/src/ingredients/ingredientFormatters';
import { useIngredientBarcodeScan } from '@/src/ingredients/useIngredientBarcodeScan';

const normalizeParam = (value: string | string[] | undefined) => {
    return Array.isArray(value) ? value[0] ?? '' : value ?? '';
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
            <Text numberOfLines={2} style={styles.resultTitle}>
                {ingredient.name}
            </Text>
            {ingredient.brand ? (
                <Text numberOfLines={1} style={styles.metaText}>
                    {ingredient.brand}
                </Text>
            ) : null}
            <Text numberOfLines={2} style={styles.nutritionText}>
                {formatIngredientNutritionPer100(ingredient)}
            </Text>
            <Text numberOfLines={1} style={styles.sourceText}>
                {getIngredientBarcodeSourceLabel(response.source)}
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
    const pathname = usePathname();
    const rowId = normalizeParam(params.rowId);
    const createPathname = pathname.startsWith('/recipes')
        ? '/recipes/ingredient-create'
        : '/ingredients/create';
    const scan = useIngredientBarcodeScan({ createPathname, rowId });
    const { height } = useWindowDimensions();
    const hasResult = Boolean(scan.result);
    const hasError = Boolean(scan.errorMessage);
    const showManualEntry = !hasResult && !hasError;
    const showPermissionHint = showManualEntry && !scan.permission?.granted;
    const cameraHeight = Math.round(
        Math.max(
            hasResult ? 104 : hasError ? 140 : 180,
            Math.min(
                height * (hasResult ? 0.14 : hasError ? 0.2 : 0.3),
                hasResult ? 140 : hasError ? 180 : 300,
            ),
        ),
    );

    return (
        <Screen
            contentStyle={[screenContentStyles.plain, styles.content]}
            edges={['top', 'bottom', 'left', 'right']}
        >
            <View style={styles.header}>
                    <Text style={styles.title}>Skenovat kód</Text>
                    <Pressable
                        accessibilityRole="button"
                        style={styles.closeButton}
                        onPress={scan.handleClose}
                    >
                        <Text style={styles.closeButtonText}>Zavřít</Text>
                    </Pressable>
            </View>

            <View style={[styles.cameraFrame, { height: cameraHeight }]}>
                    {scan.isCameraActive ? (
                        <CameraView
                            barcodeScannerSettings={{
                                barcodeTypes: scan.barcodeTypes,
                            }}
                            facing="back"
                            style={styles.camera}
                            testID="barcode-camera"
                            onBarcodeScanned={scan.handleBarcodeScanned}
                        />
                    ) : (
                        <View style={styles.cameraPlaceholder}>
                            {scan.isResolving ? (
                                <>
                                    <ActivityIndicator
                                        color="#ffffff"
                                        testID="barcode-resolve-loading"
                                    />
                                    <Text style={styles.cameraPlaceholderText}>
                                        Ověřuji {scan.lockedBarcode}...
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

            {showPermissionHint ? (
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            Pro skenování povol kameru, nebo zadej kód ručně.
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            style={styles.secondaryButton}
                            onPress={scan.requestPermission}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Povolit kameru
                            </Text>
                        </Pressable>
                    </View>
            ) : null}

            {showManualEntry ? (
                    <View style={styles.manualBox}>
                        <Text style={styles.sectionTitle}>Ruční zadání</Text>
                        <TextInput
                            accessibilityLabel="EAN kód"
                            keyboardType="number-pad"
                            placeholder="Např. 3017620422003"
                            style={styles.input}
                            value={scan.manualBarcode}
                            onChangeText={scan.setManualBarcode}
                        />
                        <Pressable
                            accessibilityRole="button"
                            disabled={scan.isResolving}
                            style={[
                                styles.secondaryButton,
                                scan.isResolving
                                    ? styles.disabledButton
                                    : null,
                            ]}
                            onPress={scan.handleManualSubmit}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Ověřit kód
                            </Text>
                        </Pressable>
                    </View>
            ) : null}

            {scan.result ? (
                    <IngredientResult
                        response={scan.result}
                        onConfirm={() => void scan.handleConfirm()}
                    />
            ) : null}

            {scan.errorMessage ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText} selectable>
                            {scan.errorMessage}
                        </Text>
                        {scan.canCreateManually ? (
                            <Pressable
                                accessibilityRole="button"
                                style={styles.secondaryButton}
                                onPress={scan.handleManualCreate}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Založit ručně
                                </Text>
                            </Pressable>
                        ) : null}
                        {scan.errorStatus === 502 ? (
                            <Pressable
                                accessibilityRole="button"
                                disabled={scan.isResolving}
                                style={[
                                    styles.secondaryButton,
                                    scan.isResolving
                                        ? styles.disabledButton
                                        : null,
                                ]}
                                onPress={scan.handleTryAgain}
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
                onPress={scan.resetScan}
            >
                <Text style={styles.textButtonText}>Skenovat znovu</Text>
            </Pressable>
        </Screen>
    );
};

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
    cameraFrame: {
        backgroundColor: '#111827',
        borderRadius: 8,
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
    content: {
        flex: 1,
        gap: 16,
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
        flexShrink: 1,
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
