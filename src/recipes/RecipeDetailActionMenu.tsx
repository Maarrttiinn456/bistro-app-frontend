import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';
import { useRouter } from 'expo-router';

type RecipeDetailActionMenuProps = {
    recipeId: string;
};

export const RecipeDetailActionMenu = ({
    recipeId,
}: RecipeDetailActionMenuProps) => {
    const router = useRouter();

    const handleEditPress = () => {
        router.push({
            pathname: '/recipes/[recipeId]/edit',
            params: { recipeId },
        });
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
                    icon: 'trash-can-outline',
                    label: 'Smazat recept',
                },
            ]}
        />
    );
};
