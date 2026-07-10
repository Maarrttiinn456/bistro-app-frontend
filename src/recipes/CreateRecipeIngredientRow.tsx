import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
    formatIngredientMacros,
    type RecipeIngredientRow,
} from '@/src/recipes/createRecipeForm';

type CreateRecipeIngredientRowProps = {
    index: number;
    row: RecipeIngredientRow;
    onRemove: (rowId: string) => void;
    onToggleDisplayAmount: (rowId: string) => void;
    onUpdate: (rowId: string, updates: Partial<RecipeIngredientRow>) => void;
};

export const CreateRecipeIngredientRow = ({
    index,
    onRemove,
    onToggleDisplayAmount,
    onUpdate,
    row,
}: CreateRecipeIngredientRowProps) => {
    const ingredientMeta = row.selectedIngredient
        ? formatIngredientMacros(row.selectedIngredient)
        : 'Bez maker';
    const handleRemovePress = () => {
        Alert.alert(
            'Odebrat surovinu?',
            `"${row.displayName}" se odebere z receptu.`,
            [
                {
                    style: 'cancel',
                    text: 'Zrušit',
                },
                {
                    onPress: () => onRemove(row.id),
                    style: 'destructive',
                    text: 'Odebrat',
                },
            ],
        );
    };

    return (
        <View style={styles.row}>
            <View style={styles.mainRow}>
                <View style={styles.nameColumn}>
                    <Text style={styles.name}>{row.displayName}</Text>
                    {row.selectedIngredient?.brand ? (
                        <Text style={styles.brand}>
                            {row.selectedIngredient.brand}
                        </Text>
                    ) : null}
                    <Text style={styles.meta}>{ingredientMeta}</Text>
                </View>

                <View style={styles.amountColumn}>
                    <View style={styles.amountInputWrap}>
                        <TextInput
                            accessibilityLabel={`Množství suroviny ${index + 1} v gramech`}
                            keyboardType="numeric"
                            placeholder="0"
                            style={styles.amountInput}
                            value={row.amountG}
                            onChangeText={(value) =>
                                onUpdate(row.id, { amountG: value })
                            }
                        />
                        <Text style={styles.amountUnit}>g</Text>
                    </View>
                    <Text style={styles.amountHint}>v receptu</Text>
                </View>
            </View>

            <View style={styles.actionRow}>
                <Pressable
                    accessibilityRole="button"
                    style={styles.textButton}
                    onPress={() => onToggleDisplayAmount(row.id)}
                >
                    <Text style={styles.textButtonText}>
                        {row.showDisplayAmount
                            ? 'Skrýt ks/lžíce'
                            : 'Zadat ks/lžíce'}
                    </Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    style={styles.removeButton}
                    onPress={handleRemovePress}
                >
                    <Text style={styles.removeButtonText}>Odebrat</Text>
                </Pressable>
            </View>

            {row.showDisplayAmount ? (
                <View style={styles.optionalBox}>
                    <Text style={styles.optionalTitle}>
                        Jak se má množství ukázat v receptu?
                    </Text>
                    <View style={styles.inlineFields}>
                        <TextInput
                            accessibilityLabel={`Zobrazovací množství suroviny ${index + 1}`}
                            keyboardType="numeric"
                            placeholder="1"
                            style={[styles.input, styles.inlineInput]}
                            value={row.displayAmount}
                            onChangeText={(value) =>
                                onUpdate(row.id, { displayAmount: value })
                            }
                        />
                        <TextInput
                            accessibilityLabel={`Zobrazovací jednotka suroviny ${index + 1}`}
                            placeholder="ks"
                            style={[styles.input, styles.inlineInput]}
                            value={row.displayUnit}
                            onChangeText={(value) =>
                                onUpdate(row.id, { displayUnit: value })
                            }
                        />
                    </View>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    actionRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
    },
    amountColumn: {
        alignItems: 'flex-end',
        gap: 4,
        minWidth: 96,
    },
    amountHint: {
        color: '#667085',
        fontSize: 12,
        lineHeight: 16,
    },
    amountInput: {
        color: '#111827',
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        minHeight: 44,
        paddingHorizontal: 10,
        paddingVertical: 8,
        textAlign: 'right',
    },
    amountInputWrap: {
        alignItems: 'center',
        borderColor: '#111827',
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        minHeight: 44,
        width: 96,
    },
    amountUnit: {
        color: '#344054',
        fontSize: 15,
        fontWeight: '800',
        paddingRight: 10,
    },
    brand: {
        color: '#475467',
        fontSize: 13,
        lineHeight: 18,
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
        minHeight: 44,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    mainRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    meta: {
        color: '#667085',
        fontSize: 12,
        lineHeight: 17,
    },
    name: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '900',
        lineHeight: 22,
    },
    nameColumn: {
        flex: 1,
        gap: 2,
    },
    optionalBox: {
        backgroundColor: '#f9fafb',
        borderColor: '#eaecf0',
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
        padding: 10,
    },
    optionalTitle: {
        color: '#344054',
        fontSize: 13,
        fontWeight: '800',
        lineHeight: 18,
    },
    removeButton: {
        justifyContent: 'center',
        minHeight: 34,
        paddingVertical: 6,
    },
    removeButtonText: {
        color: '#b42318',
        fontSize: 13,
        fontWeight: '800',
        lineHeight: 18,
    },
    row: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        gap: 10,
        padding: 12,
    },
    textButton: {
        justifyContent: 'center',
        minHeight: 34,
        paddingVertical: 6,
    },
    textButtonText: {
        color: '#175cd3',
        fontSize: 13,
        fontWeight: '800',
        lineHeight: 18,
    },
});
