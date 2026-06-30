import { FloatingActionMenu } from '@/src/components/FloatingActionMenu';

export const RecipeAddActionMenu = () => {
    return (
        <FloatingActionMenu
            accessibilityLabel="Přidat recept"
            closedIcon="plus"
            items={[
                {
                    icon: 'pencil-plus',
                    label: 'Ručně',
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
