import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import {
    getGetRecipeQueryKey,
    getGetRecipesQueryKey,
    useDeleteRecipe,
} from '@/src/api/generated/recipes/recipes';
import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';
import { useRouter } from 'expo-router';

type RecipeDetailActionMenuProps = {
    recipeId: string;
};

export const RecipeDetailActionMenu = ({
    recipeId,
}: RecipeDetailActionMenuProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const deleteRecipeMutation = useDeleteRecipe();

    const handleEditPress = () => {
        router.push({
            pathname: '/recipes/[recipeId]/edit',
            params: { recipeId },
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteRecipeMutation.mutateAsync({ recipeId });
            await queryClient.invalidateQueries({
                queryKey: getGetRecipesQueryKey(),
            });
            queryClient.removeQueries({
                queryKey: getGetRecipeQueryKey(recipeId),
            });
            router.replace('/recipes');
        } catch {
            Alert.alert('Recept se nepovedlo smazat.');
        }
    };

    const handleDeletePress = () => {
        Alert.alert(
            'Smazat recept?',
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
            accessibilityLabel="Akce receptu"
            closedIcon="dots-horizontal"
            items={[
                {
                    icon: 'pencil',
                    label: 'Upravit recept',
                    onPress: handleEditPress,
                },
                {
                    destructive: true,
                    disabled: deleteRecipeMutation.isPending,
                    hint: deleteRecipeMutation.isPending ? 'Mažu...' : undefined,
                    icon: 'trash-can-outline',
                    label: 'Smazat recept',
                    onPress: handleDeletePress,
                },
            ]}
        />
    );
};
