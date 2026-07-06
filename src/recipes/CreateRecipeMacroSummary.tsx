import { StyleSheet, Text, View } from 'react-native';

import type { MacroTotals } from '@/src/recipes/createRecipeForm';
import { formatMacroValue } from '@/src/recipes/recipeFormatters';

export const CreateRecipeMacroSummary = ({
    totals,
}: {
    totals: MacroTotals;
}) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Orientační makra</Text>
            <View style={styles.macroGrid}>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                        {formatMacroValue(totals.kcal)}
                    </Text>
                    <Text style={styles.helperText}>kcal</Text>
                </View>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                        {formatMacroValue(totals.protein)}g
                    </Text>
                    <Text style={styles.helperText}>Bílkoviny</Text>
                </View>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                        {formatMacroValue(totals.carbs)}g
                    </Text>
                    <Text style={styles.helperText}>Sacharidy</Text>
                </View>
                <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                        {formatMacroValue(totals.fat)}g
                    </Text>
                    <Text style={styles.helperText}>Tuky</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    helperText: {
        color: '#667085',
        fontSize: 13,
        lineHeight: 18,
    },
    macroGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    macroItem: {
        backgroundColor: '#f2f4f7',
        borderRadius: 8,
        minWidth: '48%',
        padding: 12,
    },
    macroValue: {
        color: '#111827',
        fontSize: 18,
        fontVariant: ['tabular-nums'],
        fontWeight: '700',
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
