import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Ingredient } from '@/src/api/generated/model';
import { CreateRecipeIngredientRow } from '@/src/recipes/CreateRecipeIngredientRow';
import type { RecipeIngredientRow } from '@/src/recipes/createRecipeForm';

type CreateRecipeIngredientsSectionProps = {
    activeRowId: string | null;
    isSearchError: boolean;
    isSearching: boolean;
    rows: RecipeIngredientRow[];
    searchedIngredients: Ingredient[];
    shouldShowResults: boolean;
    onAdd: () => void;
    onCreateIngredient: (row: RecipeIngredientRow) => void;
    onFocus: (rowId: string) => void;
    onRemove: (rowId: string) => void;
    onScan: (row: RecipeIngredientRow) => void;
    onSearchChange: (rowId: string, value: string) => void;
    onSelect: (rowId: string, ingredient: Ingredient) => void;
    onToggleDisplayAmount: (rowId: string) => void;
    onToggleMode: (row: RecipeIngredientRow) => void;
    onUpdate: (rowId: string, updates: Partial<RecipeIngredientRow>) => void;
};

export const CreateRecipeIngredientsSection = ({
    activeRowId,
    isSearchError,
    isSearching,
    onAdd,
    onCreateIngredient,
    onFocus,
    onRemove,
    onScan,
    onSearchChange,
    onSelect,
    onToggleDisplayAmount,
    onToggleMode,
    onUpdate,
    rows,
    searchedIngredients,
    shouldShowResults,
}: CreateRecipeIngredientsSectionProps) => {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Suroviny</Text>
                <Pressable
                    accessibilityRole="button"
                    style={styles.secondaryButton}
                    onPress={onAdd}
                >
                    <Text style={styles.secondaryButtonText}>
                        Přidat surovinu
                    </Text>
                </Pressable>
            </View>
            {rows.map((row, index) => (
                <CreateRecipeIngredientRow
                    key={row.id}
                    canRemove={rows.length > 1}
                    index={index}
                    isActive={row.id === activeRowId}
                    isSearchError={isSearchError}
                    isSearching={isSearching}
                    row={row}
                    searchedIngredients={searchedIngredients}
                    shouldShowResults={shouldShowResults}
                    onCreateIngredient={onCreateIngredient}
                    onFocus={onFocus}
                    onRemove={onRemove}
                    onScan={onScan}
                    onSearchChange={onSearchChange}
                    onSelect={onSelect}
                    onToggleDisplayAmount={onToggleDisplayAmount}
                    onToggleMode={onToggleMode}
                    onUpdate={onUpdate}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
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
    section: {
        gap: 12,
    },
    sectionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '800',
    },
});
