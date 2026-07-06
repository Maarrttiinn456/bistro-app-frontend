import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    getGetIngredientsQueryKey,
    useCreateIngredient,
} from '@/src/api/generated/ingredients/ingredients';
import {
    CreateIngredientBodyBaseUnit,
    type ErrorResponse,
} from '@/src/api/generated/model';
import { Screen } from '@/src/components/Screen';
import {
    createdIngredientHandoffQueryKey,
    type CreatedIngredientHandoff,
} from '@/src/ingredients/createIngredientHandoff';
import {
    parseIngredientFormNumber,
    toOptionalIngredientText,
} from '@/src/ingredients/createIngredientForm';

const getStringParam = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0] ?? '';
    }

    return value ?? '';
};

const getCreateIngredientErrorMessage = (error: unknown) => {
    const fallbackMessage = 'Surovinu se nepovedlo vytvořit.';

    if (typeof error !== 'object' || error === null) {
        return fallbackMessage;
    }

    const response = (error as AxiosError<ErrorResponse>).response;
    const status = response?.status;
    const backendError = response?.data?.error?.trim();

    if (backendError) {
        return status ? `${backendError} (HTTP ${status})` : backendError;
    }

    return status
        ? `${fallbackMessage} (HTTP ${status})`
        : fallbackMessage;
};

const CreateIngredient = () => {
    const params = useLocalSearchParams<{
        name?: string;
        rowId?: string;
    }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const createIngredientMutation = useCreateIngredient();
    const [name, setName] = useState(getStringParam(params.name));
    const [brand, setBrand] = useState('');
    const [baseUnit, setBaseUnit] = useState<CreateIngredientBodyBaseUnit>(
        CreateIngredientBodyBaseUnit.g,
    );
    const [kcalPer100, setKcalPer100] = useState('');
    const [proteinPer100, setProteinPer100] = useState('');
    const [carbsPer100, setCarbsPer100] = useState('');
    const [fatPer100, setFatPer100] = useState('');
    const [error, setError] = useState<string | null>(null);
    const rowId = getStringParam(params.rowId);

    const handleSubmit = async () => {
        const trimmedName = name.trim();
        const parsedKcalPer100 = parseIngredientFormNumber(kcalPer100);
        const parsedProteinPer100 =
            parseIngredientFormNumber(proteinPer100);
        const parsedCarbsPer100 = parseIngredientFormNumber(carbsPer100);
        const parsedFatPer100 = parseIngredientFormNumber(fatPer100);

        if (trimmedName.length === 0) {
            setError('Vyplň název suroviny.');
            return;
        }

        if (
            parsedKcalPer100 === null ||
            parsedProteinPer100 === null ||
            parsedCarbsPer100 === null ||
            parsedFatPer100 === null ||
            parsedKcalPer100 < 0 ||
            parsedProteinPer100 < 0 ||
            parsedCarbsPer100 < 0 ||
            parsedFatPer100 < 0
        ) {
            setError('Vyplň nezáporná makra na 100 g/ml.');
            return;
        }

        setError(null);

        try {
            const response = await createIngredientMutation.mutateAsync({
                data: {
                    baseUnit,
                    brand: toOptionalIngredientText(brand),
                    carbsPer100: parsedCarbsPer100,
                    fatPer100: parsedFatPer100,
                    kcalPer100: parsedKcalPer100,
                    name: trimmedName,
                    proteinPer100: parsedProteinPer100,
                },
            });

            if (rowId.length > 0) {
                queryClient.setQueryData<CreatedIngredientHandoff>(
                    createdIngredientHandoffQueryKey,
                    {
                        ingredient: response.ingredient,
                        rowId,
                    },
                );
            }

            await queryClient.invalidateQueries({
                queryKey: getGetIngredientsQueryKey(),
            });
            router.back();
        } catch (submitError) {
            setError(getCreateIngredientErrorMessage(submitError));
        }
    };

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={styles.content}
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nová surovina</Text>
                    <TextInput
                        accessibilityLabel="Název nové suroviny"
                        placeholder="Název"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        accessibilityLabel="Značka nové suroviny"
                        placeholder="Značka"
                        style={styles.input}
                        value={brand}
                        onChangeText={setBrand}
                    />
                    <View style={styles.optionGrid}>
                        {[
                            CreateIngredientBodyBaseUnit.g,
                            CreateIngredientBodyBaseUnit.ml,
                        ].map((unit) => {
                            const isSelected = baseUnit === unit;

                            return (
                                <Pressable
                                    key={unit}
                                    accessibilityRole="button"
                                    accessibilityState={{
                                        selected: isSelected,
                                    }}
                                    style={[
                                        styles.optionButton,
                                        isSelected
                                            ? styles.optionButtonSelected
                                            : null,
                                    ]}
                                    onPress={() => setBaseUnit(unit)}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            isSelected
                                                ? styles.optionButtonTextSelected
                                                : null,
                                        ]}
                                    >
                                        {unit}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    <View style={styles.inlineFields}>
                        <TextInput
                            accessibilityLabel="Kalorie na 100 g"
                            keyboardType="numeric"
                            placeholder="kcal / 100"
                            style={[styles.input, styles.inlineInput]}
                            value={kcalPer100}
                            onChangeText={setKcalPer100}
                        />
                        <TextInput
                            accessibilityLabel="Bílkoviny na 100 g"
                            keyboardType="numeric"
                            placeholder="B / 100"
                            style={[styles.input, styles.inlineInput]}
                            value={proteinPer100}
                            onChangeText={setProteinPer100}
                        />
                    </View>
                    <View style={styles.inlineFields}>
                        <TextInput
                            accessibilityLabel="Sacharidy na 100 g"
                            keyboardType="numeric"
                            placeholder="S / 100"
                            style={[styles.input, styles.inlineInput]}
                            value={carbsPer100}
                            onChangeText={setCarbsPer100}
                        />
                        <TextInput
                            accessibilityLabel="Tuky na 100 g"
                            keyboardType="numeric"
                            placeholder="T / 100"
                            style={[styles.input, styles.inlineInput]}
                            value={fatPer100}
                            onChangeText={setFatPer100}
                        />
                    </View>
                </View>
                {error ? (
                    <Text style={styles.errorText} selectable>
                        {error}
                    </Text>
                ) : null}
                <Pressable
                    accessibilityRole="button"
                    disabled={createIngredientMutation.isPending}
                    style={[
                        styles.button,
                        createIngredientMutation.isPending
                            ? styles.disabledButton
                            : null,
                    ]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonText}>
                        {createIngredientMutation.isPending
                            ? 'Ukládám surovinu...'
                            : 'Uložit surovinu'}
                    </Text>
                </Pressable>
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 8,
        justifyContent: 'center',
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    content: {
        gap: 18,
        paddingBottom: 40,
    },
    disabledButton: {
        opacity: 0.5,
    },
    errorText: {
        color: '#b42318',
        fontSize: 14,
        lineHeight: 20,
    },
    inlineFields: {
        flexDirection: 'row',
        gap: 10,
    },
    inlineInput: {
        flex: 1,
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
    optionButton: {
        alignItems: 'center',
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: 42,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    optionButtonSelected: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    optionButtonText: {
        color: '#344054',
        fontSize: 14,
        fontWeight: '700',
    },
    optionButtonTextSelected: {
        color: '#ffffff',
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '800',
    },
});

export default CreateIngredient;
