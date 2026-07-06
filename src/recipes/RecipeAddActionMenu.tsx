import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';
import { useRouter } from 'expo-router';

export const RecipeAddActionMenu = () => {
    const router = useRouter();

    const handleManualPress = () => {
        router.push('/recipes/create');
    };

    return (
        <FloatingActionMenu
            accessibilityLabel="Přidat recept"
            closedIcon="plus"
            items={[
                {
                    icon: 'pencil-plus',
                    label: 'Ručně',
                    onPress: handleManualPress,
                },
                {
                    disabled: true,
                    hint: 'Připravujeme',
                    icon: 'link-variant-plus',
                    label: 'Import z URL',
                },
            ]}
        />
    );
};
