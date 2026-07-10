import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CreateRecipeIngredientRow } from '@/src/recipes/CreateRecipeIngredientRow';
import type { RecipeIngredientRow } from '@/src/recipes/createRecipeForm';

type CreateRecipeIngredientsSectionProps = {
    rows: RecipeIngredientRow[];
    onAdd: () => void;
    onRemove: (rowId: string) => void;
    onToggleDisplayAmount: (rowId: string) => void;
    onUpdate: (rowId: string, updates: Partial<RecipeIngredientRow>) => void;
};

export const CreateRecipeIngredientsSection = ({
    onAdd,
    onRemove,
    onToggleDisplayAmount,
    onUpdate,
    rows,
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

            {rows.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                        Zatím tu není žádná surovina.
                    </Text>
                </View>
            ) : null}

            {rows.map((row, index) => (
                <CreateRecipeIngredientRow
                    key={row.id}
                    index={index}
                    row={row}
                    onRemove={onRemove}
                    onToggleDisplayAmount={onToggleDisplayAmount}
                    onUpdate={onUpdate}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    emptyBox: {
        backgroundColor: '#f9fafb',
        borderColor: '#eaecf0',
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 14,
    },
    emptyText: {
        color: '#667085',
        fontSize: 14,
        lineHeight: 20,
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
        fontWeight: '800',
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
        fontWeight: '900',
    },
});
