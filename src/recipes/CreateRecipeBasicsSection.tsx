import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { MealSlot } from '@/src/api/generated/model';
import { mealTypeOptions } from '@/src/recipes/createRecipeForm';

type CreateRecipeBasicsSectionProps = {
    name: string;
    portions: string;
    prepTimeMin: string;
    mealTypes: MealSlot[];
    onNameChange: (value: string) => void;
    onPortionsChange: (value: string) => void;
    onPrepTimeMinChange: (value: string) => void;
    onMealTypePress: (mealType: MealSlot) => void;
};

export const CreateRecipeBasicsSection = ({
    mealTypes,
    name,
    onMealTypePress,
    onNameChange,
    onPortionsChange,
    onPrepTimeMinChange,
    portions,
    prepTimeMin,
}: CreateRecipeBasicsSectionProps) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Základ</Text>
            <TextInput
                accessibilityLabel="Název receptu"
                placeholder="Název receptu"
                style={styles.input}
                value={name}
                onChangeText={onNameChange}
            />
            <View style={styles.inlineFields}>
                <TextInput
                    accessibilityLabel="Počet porcí"
                    keyboardType="numeric"
                    placeholder="Porce"
                    style={[styles.input, styles.inlineInput]}
                    value={portions}
                    onChangeText={onPortionsChange}
                />
                <TextInput
                    accessibilityLabel="Čas přípravy v minutách"
                    keyboardType="numeric"
                    placeholder="Minuty"
                    style={[styles.input, styles.inlineInput]}
                    value={prepTimeMin}
                    onChangeText={onPrepTimeMinChange}
                />
            </View>
            <View style={styles.optionGrid}>
                {mealTypeOptions.map((mealTypeOption) => {
                    const isSelected = mealTypes.includes(
                        mealTypeOption.value,
                    );

                    return (
                        <Pressable
                            key={mealTypeOption.value}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            style={[
                                styles.optionButton,
                                isSelected ? styles.optionButtonSelected : null,
                            ]}
                            onPress={() => onMealTypePress(mealTypeOption.value)}
                        >
                            <Text
                                style={[
                                    styles.optionButtonText,
                                    isSelected
                                        ? styles.optionButtonTextSelected
                                        : null,
                                ]}
                            >
                                {mealTypeOption.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
