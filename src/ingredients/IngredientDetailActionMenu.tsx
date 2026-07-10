import { useQueryClient } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import {
    getGetIngredientQueryKey,
    getGetIngredientsQueryKey,
    useArchiveIngredient,
} from '@/src/api/generated/ingredients/ingredients';
import type { Ingredient } from '@/src/api/generated/model';
import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';

type IngredientDetailActionMenuProps = {
    ingredient: Ingredient;
};

export const IngredientDetailActionMenu = ({
    ingredient,
}: IngredientDetailActionMenuProps) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const archiveIngredientMutation = useArchiveIngredient();
    const ingredientId = ingredient.id;
    const canEditIngredient = ingredient.householdId !== null;

    const handleEditPress = () => {
        router.push({
            pathname: '/ingredients/[ingredientId]/edit',
            params: { ingredientId },
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            await archiveIngredientMutation.mutateAsync({ ingredientId });
            await queryClient.invalidateQueries({
                queryKey: getGetIngredientsQueryKey(),
            });
            queryClient.removeQueries({
                queryKey: getGetIngredientQueryKey(ingredientId),
            });
            router.replace('/ingredients' as Href);
        } catch {
            Alert.alert('Ingredienci se nepovedlo smazat.');
        }
    };

    const handleDeletePress = () => {
        Alert.alert(
            'Smazat ingredienci?',
            'Tahle akce nejde vrátit zpět.',
            [
                {
                    style: 'cancel',
                    text: 'Zrušit',
                },
                {
                    onPress: () => {
                        void handleDeleteConfirm();
                    },
                    style: 'destructive',
                    text: 'Smazat',
                },
            ],
        );
    };

    return (
        <FloatingActionMenu
            accessibilityLabel="Akce ingredience"
            closedIcon="dots-horizontal"
            items={[
                {
                    disabled: !canEditIngredient,
                    hint: canEditIngredient
                        ? undefined
                        : 'Globální surovinu nejde upravit',
                    icon: 'pencil',
                    label: 'Upravit ingredienci',
                    onPress: handleEditPress,
                },
                {
                    destructive: true,
                    disabled: archiveIngredientMutation.isPending,
                    hint: archiveIngredientMutation.isPending
                        ? 'Mažu...'
                        : undefined,
                    icon: 'trash-can-outline',
                    label: 'Smazat ingredienci',
                    onPress: handleDeletePress,
                },
            ]}
        />
    );
};
