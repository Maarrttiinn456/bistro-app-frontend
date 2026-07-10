import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import {
    CreateIngredientBodyBaseUnit,
    type CreateIngredientBodyBaseUnit as IngredientFormBaseUnit,
} from '@/src/api/generated/model';
import { ModalHeader } from '@/src/components/ModalHeader';
import { screenContentStyles } from '@/src/components/Screen';

type IngredientFormState = {
    barcode: string;
    baseUnit: IngredientFormBaseUnit;
    brand: string;
    carbsPer100: string;
    fatPer100: string;
    kcalPer100: string;
    name: string;
    proteinPer100: string;
    validationError: string | null;
    handleSubmit: () => void;
    setBarcode: (value: string) => void;
    setBaseUnit: (value: IngredientFormBaseUnit) => void;
    setBrand: (value: string) => void;
    setCarbsPer100: (value: string) => void;
    setFatPer100: (value: string) => void;
    setKcalPer100: (value: string) => void;
    setName: (value: string) => void;
    setProteinPer100: (value: string) => void;
};

type IngredientFormProps = {
    form: IngredientFormState;
    isSubmitting: boolean;
    submitLabel: string;
    submittingLabel: string;
    title: string;
    onClose: () => void;
    inputLabels?: {
        barcode: string;
        brand: string;
        name: string;
    };
    scanAction?: {
        label: string;
        onPress: () => void;
    };
};

export const IngredientForm = ({
    form,
    isSubmitting,
    scanAction,
    submitLabel,
    submittingLabel,
    title,
    onClose,
    inputLabels = {
        barcode: 'Čárový kód suroviny',
        brand: 'Značka suroviny',
        name: 'Název suroviny',
    },
}: IngredientFormProps) => {
    return (
        <ScrollView
            contentContainerStyle={screenContentStyles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <ModalHeader title={title} onClose={onClose} />
            <View style={styles.section}>
                <TextInput
                    accessibilityLabel={inputLabels.name}
                    placeholder="Název"
                    style={styles.input}
                    value={form.name}
                    onChangeText={form.setName}
                />
                <TextInput
                    accessibilityLabel={inputLabels.brand}
                    placeholder="Značka"
                    style={styles.input}
                    value={form.brand}
                    onChangeText={form.setBrand}
                />
                <TextInput
                    accessibilityLabel={inputLabels.barcode}
                    keyboardType="number-pad"
                    placeholder="Čárový kód"
                    style={styles.input}
                    value={form.barcode}
                    onChangeText={form.setBarcode}
                />
                {scanAction ? (
                    <Pressable
                        accessibilityRole="button"
                        style={styles.secondaryButton}
                        onPress={scanAction.onPress}
                    >
                        <Text style={styles.secondaryButtonText}>
                            {scanAction.label}
                        </Text>
                    </Pressable>
                ) : null}
                <View style={styles.optionGrid}>
                    {[
                        CreateIngredientBodyBaseUnit.g,
                        CreateIngredientBodyBaseUnit.ml,
                    ].map((unit) => {
                        const isSelected = form.baseUnit === unit;

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
                                onPress={() => form.setBaseUnit(unit)}
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
                        value={form.kcalPer100}
                        onChangeText={form.setKcalPer100}
                    />
                    <TextInput
                        accessibilityLabel="Bílkoviny na 100 g"
                        keyboardType="numeric"
                        placeholder="B / 100"
                        style={[styles.input, styles.inlineInput]}
                        value={form.proteinPer100}
                        onChangeText={form.setProteinPer100}
                    />
                </View>
                <View style={styles.inlineFields}>
                    <TextInput
                        accessibilityLabel="Sacharidy na 100 g"
                        keyboardType="numeric"
                        placeholder="S / 100"
                        style={[styles.input, styles.inlineInput]}
                        value={form.carbsPer100}
                        onChangeText={form.setCarbsPer100}
                    />
                    <TextInput
                        accessibilityLabel="Tuky na 100 g"
                        keyboardType="numeric"
                        placeholder="T / 100"
                        style={[styles.input, styles.inlineInput]}
                        value={form.fatPer100}
                        onChangeText={form.setFatPer100}
                    />
                </View>
            </View>
            {form.validationError ? (
                <Text style={styles.errorText} selectable>
                    {form.validationError}
                </Text>
            ) : null}
            <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                style={[styles.button, isSubmitting ? styles.disabledButton : null]}
                onPress={form.handleSubmit}
            >
                <Text style={styles.buttonText}>
                    {isSubmitting ? submittingLabel : submitLabel}
                </Text>
            </Pressable>
        </ScrollView>
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
});
