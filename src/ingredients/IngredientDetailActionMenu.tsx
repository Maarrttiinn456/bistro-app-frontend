import { useQueryClient } from '@tanstack/react-query';
import { type Href, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import {
    getGetIngredientsQueryKey,
    useArchiveIngredient,
} from '@/src/api/generated/ingredients/ingredients';
import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';

type IngredientDetailActionMenuProps = {
    ingredientId: string;
};

export const IngredientDetailActionMenu = ({
    ingredientId,
}: IngredientDetailActionMenuProps) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const archiveIngredientMutation = useArchiveIngredient();

    const handleDeleteConfirm = async () => {
        try {
            await archiveIngredientMutation.mutateAsync({ ingredientId });
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
