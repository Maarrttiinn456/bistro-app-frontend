import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { Ingredient } from '@/src/api/generated/model';
import {
    formatIngredientMacros,
    type RecipeIngredientRow,
} from '@/src/recipes/createRecipeForm';

type CreateRecipeIngredientRowProps = {
    canRemove: boolean;
    index: number;
    isActive: boolean;
    isSearchError: boolean;
    isSearching: boolean;
    row: RecipeIngredientRow;
    searchedIngredients: Ingredient[];
    shouldShowResults: boolean;
    onCreateIngredient: (row: RecipeIngredientRow) => void;
    onFocus: (rowId: string) => void;
    onRemove: (rowId: string) => void;
    onSearchChange: (rowId: string, value: string) => void;
    onSelect: (rowId: string, ingredient: Ingredient) => void;
    onToggleDisplayAmount: (rowId: string) => void;
    onToggleMode: (row: RecipeIngredientRow) => void;
    onUpdate: (rowId: string, updates: Partial<RecipeIngredientRow>) => void;
};

export const CreateRecipeIngredientRow = ({
    canRemove,
    index,
    isActive,
    isSearchError,
    isSearching,
    onCreateIngredient,
    onFocus,
    onRemove,
    onSearchChange,
    onSelect,
    onToggleDisplayAmount,
    onToggleMode,
    onUpdate,
    row,
    searchedIngredients,
    shouldShowResults,
}: CreateRecipeIngredientRowProps) => {
    return (
        <View style={styles.rowCard}>
            <View style={styles.rowHeader}>
                <Text style={styles.title}>Surovina {index + 1}</Text>
                <Pressable
                    accessibilityRole="button"
                    disabled={!canRemove}
                    style={[
                        styles.removeButton,
                        canRemove ? null : styles.disabledButton,
                    ]}
                    onPress={() => onRemove(row.id)}
                >
                    <Text style={styles.removeButtonText}>Odebrat</Text>
                </Pressable>
            </View>

            {row.mode === 'catalog' ? (
                <>
                    <Text style={styles.fieldLabel}>Název</Text>
                    <TextInput
                        accessibilityLabel={`Vyhledat surovinu ${index + 1}`}
                        placeholder="Začni psát název suroviny"
                        style={styles.input}
                        value={row.searchText}
                        onFocus={() => onFocus(row.id)}
                        onChangeText={(value) => onSearchChange(row.id, value)}
                    />
                    {row.selectedIngredient ? (
                        <View style={styles.selectedBox}>
                            <Text style={styles.selectedName} selectable>
                                {row.selectedIngredient.name}
                            </Text>
                            <Text style={styles.selectedMeta} selectable>
                                {formatIngredientMacros(row.selectedIngredient)}
                            </Text>
                        </View>
                    ) : null}
                    {shouldShowResults && isActive ? (
                        <View style={styles.resultsBox}>
                            {isSearching ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator
                                        size="small"
                                        testID="ingredient-search-loading-indicator"
                                    />
                                    <Text style={styles.helperText}>
                                        Hledám suroviny...
                                    </Text>
                                </View>
                            ) : null}
                            {isSearchError ? (
                                <Text style={styles.errorText} selectable>
                                    Suroviny se nepovedlo načíst.
                                </Text>
                            ) : null}
                            {searchedIngredients.map((ingredient) => (
                                <Pressable
                                    key={ingredient.id}
                                    accessibilityRole="button"
                                    style={styles.resultItem}
                                    onPress={() => onSelect(row.id, ingredient)}
                                >
                                    <Text style={styles.resultName}>
                                        {ingredient.name}
                                    </Text>
                                    {ingredient.brand ? (
                                        <Text style={styles.helperText}>
                                            {ingredient.brand}
                                        </Text>
                                    ) : null}
                                    <Text style={styles.helperText}>
                                        {formatIngredientMacros(ingredient)}
                                    </Text>
                                </Pressable>
                            ))}
                            {!isSearching && searchedIngredients.length === 0 ? (
                                <Text style={styles.helperText}>
                                    Žádná surovina nenalezena.
                                </Text>
                            ) : null}
                            <Pressable
                                accessibilityRole="button"
                                style={styles.secondaryButton}
                                onPress={() => onCreateIngredient(row)}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Vytvořit surovinu
                                </Text>
                            </Pressable>
                        </View>
                    ) : null}
                </>
            ) : (
                <>
                    <Text style={styles.fieldLabel}>Název bez maker</Text>
                    <TextInput
                        accessibilityLabel={`Volná textová surovina ${index + 1}`}
                        placeholder="Např. špetka soli"
                        style={styles.input}
                        value={row.displayName}
                        onChangeText={(value) =>
                            onUpdate(row.id, {
                                displayName: value,
                                searchText: value,
                            })
                        }
                    />
                    <Text style={styles.warningText}>
                        Nebude se započítávat do maker receptu.
                    </Text>
                </>
            )}

            <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Množství v receptu</Text>
                <Text style={styles.fieldHint}>v gramech</Text>
            </View>
            <TextInput
                accessibilityLabel={`Gramáž suroviny ${index + 1}`}
                keyboardType="numeric"
                placeholder="Např. 100"
                style={styles.input}
                value={row.amountG}
                onChangeText={(value) => onUpdate(row.id, { amountG: value })}
            />
            <Text style={styles.helperText}>
                Tohle číslo se použije pro výpočet maker.
            </Text>

            <View style={styles.actionRow}>
                <Pressable
                    accessibilityRole="button"
                    style={styles.textButton}
                    onPress={() => onToggleDisplayAmount(row.id)}
                >
                    <Text style={styles.textButtonText}>
                        {row.showDisplayAmount
                            ? 'Skrýt jiné zobrazení'
                            : 'Zobrazit jako ks/lžíce'}
                    </Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    style={styles.textButton}
                    onPress={() => onToggleMode(row)}
                >
                    <Text style={styles.textButtonText}>
                        {row.mode === 'catalog'
                            ? 'Nemám v katalogu'
                            : 'Použít katalog'}
                    </Text>
                </Pressable>
            </View>

            {row.showDisplayAmount ? (
                <View style={styles.optionalBox}>
                    <Text style={styles.optionalTitle}>
                        Jak se má množství ukázat v receptu?
                    </Text>
                    <Text style={styles.helperText}>
                        Např. zadáš 100 g pro makra, ale v receptu ukážeš 1 ks.
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
    disabledButton: {
        opacity: 0.5,
    },
    errorText: {
        color: '#b42318',
        fontSize: 14,
        lineHeight: 20,
    },
    helperText: {
        color: '#667085',
        fontSize: 13,
        lineHeight: 18,
    },
    actionRow: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'space-between',
    },
    fieldHeader: {
        alignItems: 'baseline',
        flexDirection: 'row',
        gap: 8,
    },
    fieldHint: {
        color: '#667085',
        fontSize: 12,
        lineHeight: 16,
    },
    fieldLabel: {
        color: '#344054',
        fontSize: 13,
        fontWeight: '700',
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
        minHeight: 46,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    loadingRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
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
        fontWeight: '700',
        lineHeight: 18,
    },
    removeButton: {
        borderColor: '#fecdca',
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    removeButtonText: {
        color: '#b42318',
        fontSize: 13,
        fontWeight: '700',
    },
    resultItem: {
        borderBottomColor: '#eaecf0',
        borderBottomWidth: 1,
        gap: 3,
        paddingVertical: 10,
    },
    resultName: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '700',
    },
    resultsBox: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
        padding: 10,
    },
    rowCard: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        gap: 10,
        padding: 12,
    },
    rowHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'space-between',
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
    selectedBox: {
        backgroundColor: '#ecfdf3',
        borderColor: '#abefc6',
        borderRadius: 8,
        borderWidth: 1,
        gap: 2,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    selectedMeta: {
        color: '#027a48',
        fontSize: 13,
        lineHeight: 18,
    },
    selectedName: {
        color: '#05603a',
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    textButton: {
        minHeight: 34,
        justifyContent: 'center',
        paddingVertical: 6,
    },
    textButtonText: {
        color: '#175cd3',
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 18,
    },
    title: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '700',
    },
    warningText: {
        color: '#b54708',
        fontSize: 13,
        lineHeight: 18,
    },
});
