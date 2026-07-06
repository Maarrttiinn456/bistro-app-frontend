import { useQueryClient } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { getGetIngredientsQueryKey } from '@/src/api/generated/ingredients/ingredients';
import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';
import { useDeleteIngredient } from '@/src/ingredients/ingredientApi';

type IngredientDetailActionMenuProps = {
    ingredientId: string;
};

export const IngredientDetailActionMenu = ({
    ingredientId,
}: IngredientDetailActionMenuProps) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const deleteIngredientMutation = useDeleteIngredient();

    const handleDeleteConfirm = async () => {
        try {
            await deleteIngredientMutation.mutateAsync({ ingredientId });
            await queryClient.invalidateQueries({
                queryKey: getGetIngredientsQueryKey(),
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
                    disabled: true,
                    hint: 'Připravujeme',
                    icon: 'pencil',
                    label: 'Upravit ingredienci',
                },
                {
                    destructive: true,
                    disabled: deleteIngredientMutation.isPending,
                    hint: deleteIngredientMutation.isPending
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
