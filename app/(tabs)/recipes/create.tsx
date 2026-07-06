import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Screen } from '@/src/components/Screen';
import { CreateRecipeBasicsSection } from '@/src/recipes/CreateRecipeBasicsSection';
import { CreateRecipeIngredientsSection } from '@/src/recipes/CreateRecipeIngredientsSection';
import { CreateRecipeMacroSummary } from '@/src/recipes/CreateRecipeMacroSummary';
import { CreateRecipeOptionalDetails } from '@/src/recipes/CreateRecipeOptionalDetails';
import { useCreateRecipeForm } from '@/src/recipes/useCreateRecipeForm';

const CreateRecipe = () => {
    const router = useRouter();
    const form = useCreateRecipeForm({
        onCreateIngredient: ({ name, rowId }) => {
            router.push({
                pathname: '/recipes/create-ingredient',
                params: { name, rowId },
            });
        },
        onRecipeCreated: (recipeId) => {
            router.push({
                pathname: '/recipes/[recipeId]',
                params: { recipeId },
            });
        },
    });

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={styles.content}
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <CreateRecipeBasicsSection
                    mealTypes={form.mealTypes}
                    name={form.name}
                    portions={form.portions}
                    prepTimeMin={form.prepTimeMin}
                    onMealTypePress={form.handleMealTypePress}
                    onNameChange={form.setName}
                    onPortionsChange={form.setPortions}
                    onPrepTimeMinChange={form.setPrepTimeMin}
                />
                <CreateRecipeIngredientsSection
                    activeRowId={form.activeIngredientRowId}
                    isSearchError={form.ingredientsQuery.isError}
                    isSearching={form.ingredientsQuery.isLoading}
                    rows={form.ingredientRows}
                    searchedIngredients={form.searchedIngredients}
                    shouldShowResults={form.shouldShowIngredientResults}
                    onAdd={form.handleAddIngredientRow}
                    onCreateIngredient={form.handleCreateIngredient}
                    onFocus={form.setActiveIngredientRowId}
                    onRemove={form.handleRemoveIngredientRow}
                    onSearchChange={form.handleIngredientSearchChange}
                    onSelect={form.handleIngredientSelect}
                    onToggleDisplayAmount={form.handleToggleDisplayAmount}
                    onToggleMode={form.handleIngredientModeToggle}
                    onUpdate={form.updateIngredientRow}
                />
                <CreateRecipeMacroSummary totals={form.macroTotals} />
                <CreateRecipeOptionalDetails
                    image={form.image}
                    isOpen={form.isOptionalDetailsOpen}
                    sourceUrl={form.sourceUrl}
                    steps={form.steps}
                    onImageChange={form.setImage}
                    onSourceUrlChange={form.setSourceUrl}
                    onStepsChange={form.setSteps}
                    onToggle={() =>
                        form.setIsOptionalDetailsOpen(
                            !form.isOptionalDetailsOpen,
                        )
                    }
                />
                {form.validationError ? (
                    <Text style={styles.errorText} selectable>
                        {form.validationError}
                    </Text>
                ) : null}
                <Pressable
                    accessibilityRole="button"
                    disabled={form.createRecipeMutation.isPending}
                    style={[
                        styles.button,
                        form.createRecipeMutation.isPending
                            ? styles.disabledButton
                            : null,
                    ]}
                    onPress={form.handleSubmit}
                >
                    <Text style={styles.buttonText}>
                        {form.createRecipeMutation.isPending
                            ? 'Vytvářím recept...'
                            : 'Vytvořit recept'}
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
});

export default CreateRecipe;
