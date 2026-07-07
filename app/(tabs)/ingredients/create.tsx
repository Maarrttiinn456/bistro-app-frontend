import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { CreateIngredientBodyBaseUnit } from '@/src/api/generated/model';
import { Screen } from '@/src/components/Screen';
import { useCreateIngredientForm } from '@/src/ingredients/useCreateIngredientForm';

const getStringParam = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0] ?? '';
    }

    return value ?? '';
};

const CreateIngredient = () => {
    const params = useLocalSearchParams<{
        barcode?: string;
        name?: string;
        rowId?: string;
    }>();
    const router = useRouter();
    const form = useCreateIngredientForm({
        initialBarcode: getStringParam(params.barcode),
        initialName: getStringParam(params.name),
        rowId: getStringParam(params.rowId),
        onIngredientCreated: () => router.back(),
    });

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
                        value={form.name}
                        onChangeText={form.setName}
                    />
                    <TextInput
                        accessibilityLabel="Značka nové suroviny"
                        placeholder="Značka"
                        style={styles.input}
                        value={form.brand}
                        onChangeText={form.setBrand}
                    />
                    <TextInput
                        accessibilityLabel="Čárový kód nové suroviny"
                        keyboardType="number-pad"
                        placeholder="Čárový kód"
                        style={styles.input}
                        value={form.barcode}
                        onChangeText={form.setBarcode}
                    />
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
                    disabled={form.createIngredientMutation.isPending}
                    style={[
                        styles.button,
                        form.createIngredientMutation.isPending
                            ? styles.disabledButton
                            : null,
                    ]}
                    onPress={form.handleSubmit}
                >
                    <Text style={styles.buttonText}>
                        {form.createIngredientMutation.isPending
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
