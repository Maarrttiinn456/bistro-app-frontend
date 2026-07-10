import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { Ingredient } from '@/src/api/generated/model';
import { ModalHeader } from '@/src/components/ModalHeader';
import { formatIngredientMacros } from '@/src/recipes/createRecipeForm';

type CreateRecipeIngredientPickerProps = {
    isError: boolean;
    isSearching: boolean;
    searchText: string;
    searchedIngredients: Ingredient[];
    shouldShowResults: boolean;
    onClose: () => void;
    onCreateIngredient: () => void;
    onScan: () => void;
    onSearchChange: (value: string) => void;
    onSelect: (ingredient: Ingredient) => void;
};

export const CreateRecipeIngredientPicker = ({
    isError,
    isSearching,
    onClose,
    onCreateIngredient,
    onScan,
    onSearchChange,
    onSelect,
    searchText,
    searchedIngredients,
    shouldShowResults,
}: CreateRecipeIngredientPickerProps) => {
    const trimmedSearchText = searchText.trim();
    const canCreateIngredient =
        shouldShowResults &&
        !isSearching &&
        !isError &&
        trimmedSearchText.length > 0 &&
        searchedIngredients.length === 0;

    return (
        <View style={styles.container}>
            <ModalHeader
                closeAccessibilityLabel="Zavřít výběr suroviny"
                subtitle="Vyber z uložených surovin."
                title="Přidat surovinu"
                onClose={onClose}
            />

            <TextInput
                accessibilityLabel="Vyhledat surovinu"
                autoFocus
                placeholder="Začni psát název suroviny"
                style={styles.input}
                value={searchText}
                onChangeText={onSearchChange}
            />

            <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={onScan}
            >
                <Text style={styles.secondaryButtonText}>Naskenovat kód</Text>
            </Pressable>

            <ScrollView
                contentContainerStyle={styles.resultsContent}
                keyboardShouldPersistTaps="handled"
                style={styles.results}
            >
                {shouldShowResults && isSearching ? (
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

                {shouldShowResults && isError ? (
                    <Text style={styles.errorText} selectable>
                        Suroviny se nepovedlo načíst.
                    </Text>
                ) : null}

                {shouldShowResults
                    ? searchedIngredients.map((ingredient) => (
                          <View key={ingredient.id} style={styles.resultItem}>
                              <View style={styles.resultText}>
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
                              </View>
                              <Pressable
                                  accessibilityLabel={`Přidat ${ingredient.name}`}
                                  accessibilityRole="button"
                                  style={styles.addButton}
                                  onPress={() => onSelect(ingredient)}
                              >
                                  <Text style={styles.addButtonText}>
                                      Přidat
                                  </Text>
                              </Pressable>
                          </View>
                      ))
                    : null}

                {canCreateIngredient ? (
                    <Pressable
                        accessibilityRole="button"
                        style={styles.createButton}
                        onPress={onCreateIngredient}
                    >
                        <Text style={styles.createButtonText}>
                            {`Přidat "${trimmedSearchText}" do databáze`}
                        </Text>
                    </Pressable>
                ) : null}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    addButton: {
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 8,
        justifyContent: 'center',
        minHeight: 38,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '800',
    },
    container: {
        flex: 1,
        gap: 14,
    },
    createButton: {
        alignItems: 'center',
        borderColor: '#111827',
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 44,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    createButtonText: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
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
    input: {
        borderColor: '#d0d5dd',
        borderRadius: 8,
        borderWidth: 1,
        color: '#111827',
        fontSize: 16,
        minHeight: 48,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    loadingRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    resultItem: {
        alignItems: 'center',
        borderBottomColor: '#eaecf0',
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 12,
    },
    resultName: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '800',
    },
    resultText: {
        flex: 1,
        gap: 3,
    },
    results: {
        flex: 1,
    },
    resultsContent: {
        gap: 10,
        paddingBottom: 4,
    },
    secondaryButton: {
        alignItems: 'center',
        borderColor: '#111827',
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 44,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: '#111827',
        fontSize: 14,
        fontWeight: '800',
    },
});
